var fs = require('fs');
var buf = fs.readFileSync("./songs");

var fi = 0;
for(let i=0; i<buf.length;) {

  const mJ = buf.readUint16BE(i);
  const mM = buf.readUint32BE(i+2);
  fs.writeFileSync("./"+fi+".jpg", buf.subarray(i+6, i+6+mJ));
  fs.writeFileSync("./"+fi+".mp3", buf.subarray(i+6+mJ, i+6+mJ+mM));
  ++fi;
  i+=6+mJ+mM;

}

