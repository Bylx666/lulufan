
var fs = require('fs');
var buf = Buffer.allocUnsafe(0);

for(let i=0; i<=12; ++i) {

  var m = fs.readFileSync("./"+i+".jpg");
  var n = fs.readFileSync("./"+i+".mp3");
  var meta = Buffer.alloc(6);
  meta.writeUint16BE(m.length);
  meta.writeUint32BE(n.length,2);
  buf = Buffer.concat([buf, meta, m, n]);

}

fs.writeFileSync("./concated", buf);
console.log(buf.length);
