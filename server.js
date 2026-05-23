const https = require('https');
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

require('http').createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  if(req.method!=='POST'||req.url!=='/v1/messages'){res.writeHead(404);res.end('Not found');return;}
  let body='';
  req.on('data',chunk=>body+=chunk);
  req.on('end',()=>{
    const opts={hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_API_KEY,
        'anthropic-version':'2023-06-01','Content-Length':Buffer.byteLength(body)}};
    const pr=https.request(opts,r=>{
      res.writeHead(r.statusCode,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
      r.pipe(res);
    });
    pr.on('error',e=>{res.writeHead(500);res.end(JSON.stringify({error:e.message}));});
    pr.write(body);pr.end();
  });
}).listen(PORT,()=>console.log('Mora proxy on port '+PORT));
