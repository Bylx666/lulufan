const http = require('http');
const mongo = new require('mongodb').MongoClient;
const db = new mongo("mongodb+srv://adm:6ePzbwaJC2aQP9wb@cluster.hkdun.mongodb.net/cluster?retryWrites=true&w=majority");
const mess = db.db("lulu").collection("mess");

http.createServer((q,r)=> {

  r.setHeader("Access-Control-Allow-Origin", "http://localhost:8088");
  if(q.method==="POST") {

    let d = "";
    q.on("data", (c)=> d+=c);
    q.on("end", ()=> {
      
      try {

        d = JSON.parse(d);
        mess.findOne({}, {sort: {i: -1}}).then((v)=> {

          var i = v?(v.i+1):1;
          return mess.insertOne({
            "t": Date.now(),
            "n": d.n,
            "c": d.c,
            "i": i
          }).then((v)=> {

            r.end("1");

          });
        });
        
      }catch {

        r.writeHead(403);
        r.end("");

      }

    });

  }else if(q.method==="GET") {

    mess.find({}).sort({i:-1}).toArray().then((v)=> {

      r.end(JSON.stringify(v));

    });
  }

}).listen(800);

