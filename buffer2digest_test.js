const path = require("path")
const fs   = require("fs")
const http = require("http")

const handle_file = (q,s, name, type="text/html; charset=UTF-8") => {
  s.setHeader("Content-Type", type)
  return new Promise(r=>fs.readFile(name, {encoding:null, flag:"r"}, (err,data)=>r({err,data})))
  .then(r=>{
    const {
      err,
      data,
    } = r
    const ng = [ err ]
      .filter(e => !! e)
      .map(_ => {
	s.setHeader("Content-Type", "text/plain; charset=UTF-8")
	s.statusCode = 500
	s.end("error.")
      })
    const ok = [ err ]
      .filter(e => ! e)
      .map(_ => {
	s.statusCode = 200
	s.end(data)
      })
  })
}

const handler = (q,s)=>{
  const { url } = q
  switch(url){
    default:      return s.end("")
    case "/zero": return handle_file(q,s, "./test/zero/index.html")
    case "/buffer2digest.js": return handle_file(q,s, "./buffer2digest.js", "application/javascript")
  }
}

const { Builder } = require("selenium-webdriver")

const chrome = require("selenium-webdriver/chrome")

const timeout = 65536
const port = 60580

require("chromedriver")

const Buffer2Digest = require("./buffer2digest")

describe("node", () => {

  describe("buffer2digest", () => {

    test("zero", () => Promise.resolve(new ArrayBuffer(32))
      .then(ab => new Promise(r=>Buffer2Digest.buffer2digest(ab, "SHA256", b=>r(b))))
      .then(ab => Buffer.from(ab))
      .then(buf => buf.toString("hex"))
      .then(s => expect(s).toBe("66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925"))
    )

  })

})

describe("chrome", () => {

  describe("buffer2digest", () => {

    const state = {
      browser: null,
      server:  null,
    }

    beforeAll(() => Promise.resolve(new Builder())
      .then(b=>b.forBrowser("chrome"))
      .then(b=>b.setChromeOptions(new chrome.Options().headless()))
      .then(b=>b.build())
      .then(b=>Object.assign(state, {browser:b}))
      .then(_=>http.createServer(handler))
      .then(s=>Object.assign(state, {server:s}))
      .then(_=>state.server.listen(port))
    , timeout)

    afterAll(() => Promise.resolve(state.browser)
      .then(b=>b.quit())
      .then(_=>state.server)
      .then(s=>new Promise(r=>s.close(r)))
    , timeout)

    test("zero", () => Promise.resolve(state.browser)
      .then(b=>b.get("http://localhost:"+port+"/zero"))
      .then(_=>state.browser.getTitle())
      //.then(t=>expect(t).toBe("66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925"))
    , timeout)

  })

})
