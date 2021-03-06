(function(g,f){

  const n = [ typeof module ]
    .filter(function(t){ return "object" === t })
    .map(function(_){ return typeof module.exports })
    .filter(function(t){ return "object" === t })
    .map(function(_){ return "node" })

  const ie11 = [ typeof msCrypto ]
    .filter(function(t){ return "object" === t })
    .map(function(_){ return "ie11" })

  const b = [ typeof crypto ]
    .filter(function(t){ return "object" === t })
    .map(function(_){ return "browser" })

  const type = n[0] || ie11[0] || b[0]

  switch(type){
    default: break
    case "node": return f(module.exports, "node")
    case "browser":
    case "ie11":
      g.Buffer2Digest = {}
      return f(g.Buffer2Digest, type)
  }

})(this, function(e, type){
switch(type){
  default: break
  case "ie11":
    e.buffer2digest = function(ab, algorithm, callback){
      const d = window.msCrypto.subtle.digest(algorithm)
      d.addEventListener("complete", function(){ callback(d.result) })
      d.process(ab)
      d.finish()
    }
    break
  case "browser":
    e.buffer2digest = function(ab, algorithm, callback){
      return window.crypto.subtle.digest(algorithm, ab)
      .then(callback)
    }
    break
  case "node":
    const crypto = require("crypto")
    e.buffer2digest_buf = function(ab, algorithm){
      const h = crypto.createHash(algorithm)
      h.update(Buffer.from(ab))
      return h.digest()
    }
    e.buffer2digest = function(ab, algorithm, callback){
      const b = e.buffer2digest_buf(ab, algorithm)
      callback(b.buffer)
    }
    break
}
})
