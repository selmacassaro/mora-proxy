const https = require('https');
const http = require('http');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;
const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Requested-With','Access-Control-Max-Age':'86400'};
http.createServer((req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,CORS);res.end();return;}
  if(req.method==='GET'){res.writeHead(200,{...CORS,'Content-Type':'text/plain'});res.end('Mora proxy running');return;}
  if(req.method!=='POST'||req.url!=='/v1/messages'){res.writeHead(404,CORS);res.end('Not found');return;}
  let body='';
  req.on('data',chunk=>{body+=chunk.toString();});
  req.on('end',()=>{
    const buf=Buffer.from(body);
    const opts={hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','Content-Length':buf.length}};
    const pr=https.request(opts,r=>{res.writeHead(r.statusCode,{...CORS,'Content-Type':'application/json'});r.pipe(res);});
    pr.on('error',e=>{res.writeHead(500,CORS);res.end(JSON.stringify({error:{message:e.message}}));});
    pr.write(buf);pr.end();
  });
}).listen(PORT,()=>console.log('Mora proxy on port '+PORT));
