const SERVER_PORT = process.env.SERVER_PORT || 8081;

const http = require('http');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/hello/api/callback/success') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('Received request body:', body);
            console.log('Request headers:', req.headers);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Request received successfully',
                data: JSON.parse(body)
            }));
        });
    } else if (req.method === 'POST' && req.url === '/hello/api/hello') { 
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('Received request body:', body);
            console.log('Request headers:', req.headers);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Hello, world!',
                data: JSON.parse(body)
            }));
        });
    } else {
        res.writeHead(418);
        res.end();
    }
});

server.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received.');
    server.close(() => {
        console.log('App1 closed.');
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT signal received.');
    server.close(() => {
        console.log('App1 closed.');
    });
  });
  