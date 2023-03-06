const http = require("http");
const https = require("https");
const url = require("url");

const hostname = process.env.PROXY_HOST ?? "0.0.0.0";
const port = process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT) : 8080;

const server = http.createServer((clientRequest, clientResponse) => {
  const parsedUrl = url.parse(clientRequest.url);

  const options = {
    host: parsedUrl.host,
    path: parsedUrl.path,
    method: clientRequest.method,
    headers: clientRequest.headers,
  };

  const proxyRequest = https.request(options, (proxyResponse) => {
    clientResponse.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(clientResponse, {
      end: true,
    });
  });

  clientRequest.on("data", (chunk) => {
    proxyRequest.write(chunk, "binary");
  });

  clientRequest.on("end", () => {
    proxyRequest.end();
  });

  proxyRequest.on("error", (err) => {
    console.error(err);
    clientResponse.statusCode = 500;
    clientResponse.end();
  });
});

server.listen(port, hostname, () => {
  console.log(`Proxy server running at http://${hostname}:${port}/`);
});
