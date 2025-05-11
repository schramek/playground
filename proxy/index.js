const SERVER_PORT = process.env.SERVER_PORT || 8080;
const TARGET_HOSTNAME = process.env.TARGET_HOSTNAME || 'localhost'; //'app1.default.svc.cluster.local';
const TARGET_PORT = process.env.TARGET_PORT || 8081;
const X_ENV_KEY = process.env.X_ENV_KEY || 'x-kubernetes-namespace';
const CHECK_URL = process.env.CHECK_URL || '/api/callback/success';
const X_ENV_VALUE_JSON_PATH = process.env.X_ENV_VALUE_JSON_PATH || 'jsonpath.key';
const X_ENV_DEFAULT_VALUE = process.env.X_ENV_DEFAULT_VALUE || 'staging';
const X_ENV_VALUE_TEST = process.env.X_ENV_VALUE_TEST || 'test';
const DEBUG = process.env.DEBUG || false;

const http = require('http');

console.log('Environment Parameters:');
console.log('SERVER_PORT:', SERVER_PORT);
console.log('CHECK_URL:', CHECK_URL);
console.log('TARGET_HOSTNAME:', TARGET_HOSTNAME);
console.log('TARGET_PORT:', TARGET_PORT);
console.log('X_ENV_KEY:', X_ENV_KEY);
console.log('X_ENV_VALUE_JSON_PATH:', X_ENV_VALUE_JSON_PATH);
console.log('X_ENV_DEFAULT_VALUE:', X_ENV_DEFAULT_VALUE);
console.log('X_ENV_VALUE_TEST:', X_ENV_VALUE_TEST);
console.log('DEBUG:', DEBUG);


/**
 * Get a value from a JSON object using a path string
 * @param {Object} obj - The JSON object to search in
 * @param {string} path - The path to the value (e.g., "user.address.city")
 * @param {*} defaultValue - Optional default value if path doesn't exist
 * @returns {*} The value at the specified path or default value
 */
function getJsonPathValue(obj, path, defaultValue = undefined) {
    // Handle null/undefined input
    if (!obj || !path) {
        return defaultValue;
    }

    // Split the path into parts
    const parts = path.split('.');
    
    // Traverse the object
    let current = obj;
    for (const part of parts) {
        // Check if current is null/undefined or if part doesn't exist
        if (current === null || current === undefined || !(part in current)) {
            return defaultValue;
        }
        current = current[part];
    }

    return current;
}

const server = http.createServer((req, res) => {

    if(req.url && req.url.includes(CHECK_URL)) {
        
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            if (DEBUG) {
                console.log('url: ', req.url);
                console.log('body: ', body);
                console.log('headers: ', req.headers);
            }
            
            const envValue = getJsonPathValue(JSON.parse(body), X_ENV_VALUE_JSON_PATH);
            if (DEBUG) {
                console.log('envValue: ', envValue);
            }
            let additionalHeader = {};
            if (envValue) {
                if (envValue === X_ENV_VALUE_TEST) {
                    additionalHeader = {[X_ENV_KEY]: X_ENV_VALUE_TEST};
                } else {
                    additionalHeader = {[X_ENV_KEY]: X_ENV_DEFAULT_VALUE};
                }
            }
            
            const options = {
                hostname: TARGET_HOSTNAME,
                port: TARGET_PORT,
                path: req.url,
                method: req.method,
                headers: {
                    ...req.headers,
                    ...additionalHeader
                }
            };

            if (DEBUG) {
                console.log('options: ', options);
            }

            const proxyReq = http.request(options, (proxyRes) => {
                // Forward response status and headers
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                
                // Forward response body
                proxyRes.pipe(res);
            });

            proxyReq.on('error', (error) => {
                console.error('Proxy error:', error);
                res.writeHead(500);
                res.end('Proxy error');
            });

            // Forward request body
            if (body) {
                proxyReq.write(body);
            }
            proxyReq.end();
        });
    } else {
        // Forward request directly without reading body
        const options = {
            hostname: TARGET_HOSTNAME,
            port: TARGET_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        if (DEBUG) {
            console.log('options: ', options);
        }

        const proxyReq = http.request(options, (proxyRes) => {
            // Forward response status and headers
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            
            // Forward response body
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            console.error('Proxy error:', error);
            res.writeHead(500);
            res.end('Proxy error');
        });

        // Pipe the request body directly
        req.pipe(proxyReq);
    }
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
  