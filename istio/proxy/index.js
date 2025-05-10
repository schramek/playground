const SERVER_PORT = process.env.SERVER_PORT || 8080;
const TARGET_HOSTNAME = process.env.TARGET_HOSTNAME || 'app1.default.svc.cluster.local';
const TARGET_PORT = process.env.TARGET_PORT || 80;
const X_ENV_KEY = process.env.X_ENV_KEY || 'x-kubernetes-namespace';
const X_ENV_VALUE_JSON_PATH = process.env.X_ENV_VALUE_JSON_PATH || 'jsonpath.key';
const X_ENV_DEFAULT_VALUE = process.env.X_ENV_DEFAULT_VALUE || 'staging';
const X_ENV_VALUE_TEST = process.env.X_ENV_VALUE_TEST || 'test';

const http = require('http');

const server = http.createServer((req, res) => {

    const options = {
        hostname: TARGET_HOSTNAME,
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    // Create a new request
    const proxyReq = http.request(options, (proxyRes) => {

        if (proxyRes.body && proxyRes.body[X_ENV_VALUE_JSON_PATH]) {
            if (proxyRes.body[X_ENV_VALUE_JSON_PATH] === X_ENV_VALUE_TEST) {
                res.setHeader(X_ENV_KEY, X_ENV_VALUE_TEST);
            } else {
                res.setHeader(X_ENV_KEY, X_ENV_DEFAULT_VALUE);
            }
        }

        // Forward the response status code and headers
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // Forward the response body directly
        proxyRes.pipe(res);
    });

    // Forward the request body directly
    req.pipe(proxyReq);

    proxyReq.on('error', (error) => {
        console.error('Proxy error:', error);
        res.writeHead(500);
        res.end('Proxy error');
    });
});

server.listen(SERVER_PORT, () => {
    console.log("Sidecar-Proxy started...");
    console.log(`Server is running on port ${SERVER_PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received.');
    server.close(() => {
        console.log('Sidecar-Proxy closed.');
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT signal received.');
    server.close(() => {
        console.log('Sidecar-Proxy closed.');
    });
  });
  