const fs = require('fs');
let buf = Buffer.allocUnsafe(0);

fs.readdirSync("./").forEach((v)=> {
  
  if(v.endsWith(".js")) return 0;
  const c = fs.readFileSync("./"+v);
  const n = Buffer.allocUnsafe(20);
  n.write(v);
  const s = Buffer.allocUnsafe(4);
  s.writeUint32BE(c.byteLength);
  buf = Buffer.concat([buf, n, s, c]);
});
fs.writeFileSync("./luse", buf);
console.log(buf.byteLength);
