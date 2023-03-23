const https = require('https');

module.exports = (req, res)=> {

  if(req.method==='GET') {
    
    const path = req.query.path ? (
      req.query.path.indexOf('/')===0?
      req.query.path.substring(1, req.query.path.length):
      req.query.path
    ) : '';

    const ghReq = https.request({
      hostname: 'api.github.com',
      port: 443,
      path: '/repos/Bylx666/bed/contents/'+path,
      method: 'GET',
      headers: {
        "User-Agent": "Bylx666",
        "Authorization": "token "+process.env.repo_token
      }

    }, (ghRes)=>{
    
      var data = '';
    
      ghRes.setEncoding('utf8');
      ghRes.on('data', (chunk)=> {
        data += chunk;
      });
      ghRes.on('end', ()=> {
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      });
    
    });
  
    ghReq.end();

  }
  else if(req.method==='POST') {

    var reqBody = '';
    req.on('data', (chunk)=> {

      reqBody += chunk;

    });
    req.on('end', ()=> {

      reqBody = JSON.parse(reqBody);

      if(reqBody.admin!==process.env.admin) {

        res.status(403);
        res.json({error: '你管理员密码寄了'});
        return false;

      }

      var method = '';
      var body = {};

      if(reqBody.action==='put') {

        method = 'PUT';
        if(!reqBody.content) {

          res.status(403);
          res.json({error: '要写上 content 哦~base64版的。'});
          return false;

        }
        body.content = reqBody.content;

      }else if(reqBody.action==='del') {

        method = 'DELETE';

      }else {

        res.status(403);
        res.json({error: '未知行为。是否在 body 中设置正确的 action ?'});
        return false;

      }

      if(!reqBody.message) {

        res.status(403);
        res.json({error: '需要在 body 中提供 message'});
        return false;

      }
      body.message = reqBody.message;

      if(!reqBody.path) {

        res.status(403);
        res.json({error: '你文件路径呢？？'});
        return false;

      }
      
      if(reqBody.sha) {

        body.sha = reqBody.sha;

      }

      const ghReq = https.request({
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/Bylx666/bed/contents/'+ encodeURIComponent(reqBody.path),
        method: method,
        headers: {
          "User-Agent": "Bylx666",
          "Content-Length": Buffer.byteLength(JSON.stringify(body)),
          "Authorization": "token "+process.env.repo_token
        }

      }, (ghRes)=>{
      
        var data = '';
      
        ghRes.setEncoding('utf8');

        ghRes.on('data', (chunk)=> {

          data += chunk;

        });
        
        ghRes.on('end', ()=> {

          res.setHeader('Content-Type', 'application/json');
          res.end(data);

        });
      
      });
      
      ghReq.end(JSON.stringify(body));
    });

  }
  
};
