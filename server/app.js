import http from "node:http";
import fs, { rename, rm } from "node:fs/promises";
import mime from 'mime-types'
import { createWriteStream } from "node:fs";

const server = http.createServer( async(req, res) => {
  res.setHeader('Access-Control-Allow-Origin' , '*') //for anyone can fetch 
  res.setHeader('Access-Control-Allow-Headers' , '*')
  res.setHeader('Access-Control-Allow-Methods' , '*')

if(req.method === 'GET'){
  if (req.url === "/favicon.ico") {
    return res.end("No favicon");  
  }
  if (req.url === "/") {
    serveDirectory(req, res);
  } else {
    try {
      const [url, queryString] = req.url.split("?");
      let  queryParams = {}

      queryString?.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        queryParams[key] = value;
      });
      
      const fileHandel = await fs.open(`./storage${decodeURIComponent(url)}`);
      const fileStats = await fileHandel.stat();
      if (fileStats.isDirectory()) {
        serveDirectory(req, res);
      } else {
        const readStream = fileHandel.createReadStream();
          res.setHeader('Content-Type' , mime.contentType(url.slice(1)))
          res.setHeader('Content-Length' ,fileStats.size)
          console.log(mime.contentType(url.slice(1)))
        if(queryParams.action === 'download'){
          res.setHeader('Content-Disposition', `attachment; filename="${url.slice(1)}"`)
        }
        readStream.pipe(res);
      }
    } catch (err) {
      console.log(err);
      res.end("404 NOT FOUND!");
    }
  }
} else if(req.method ==='OPTIONS'){
  res.end('OK')
} else if(req.method === 'POST'){
  const writeStream = createWriteStream(`./storage/${req.headers.filename}`)
  req.on('data' ,(chunk)=> {
writeStream.write(chunk)
  })
  req.on('end' , ()=> {
    console.log('File completed')
    res.end('File sucessfully uploaded!')
    writeStream.end()
    
  })
} else if(req.method === 'DELETE'){
  req.on('data' , async(chunk)=> {
 try{
  console.log(chunk.toString());
  const filename = chunk.toString()
  await rm(`./storage/${filename}`)
  res.end(' File Deleted sucessfully!')
 }catch(err){
  res.end("Error occured!!")
 }

  })
} else if(req.method ==='PATCH'){
  req.on('data' , async(chunk)=> {
    const data = JSON.parse(chunk.toString())
    console.log(data);
    await rename(`./storage/${data.oldFilename}` ,`./storage/${data.newFilename}` )
    res.end('File renamed Sucessfully !!')
  })
}

});

async function serveDirectory(req, res){
  const [url ] = req.url.split("?");

  const itemsList = await fs.readdir(`./storage${decodeURIComponent(url)}`);

  res.setHeader('Content-Type' , "application/json")
  res.end(JSON.stringify(itemsList))
  
}
server.listen(80, '192.168.1.3' , () => {
  console.log("Server started on IPv6");
});
 