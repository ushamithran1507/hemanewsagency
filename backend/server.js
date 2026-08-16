const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hema News Agency</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 600px;
            text-align: center;
          }
          h1 {
            color: #667eea;
            margin: 0 0 20px 0;
          }
          p {
            color: #666;
            line-height: 1.6;
          }
          .status {
            background: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            border-radius: 4px;
          }
          .endpoint {
            background: #f5f5f5;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-family: monospace;
            color: #333;
          }
          .badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📰 Hema News Agency</h1>
          <p>News Distribution Platform</p>
          <div class="status">
            <strong>✅ Server Status: Online</strong>
            <p>The backend API is running successfully on Railway.</p>
          </div>
          <h3>Available Endpoints</h3>
          <div class="endpoint">GET /api/health</div>
          <div class="endpoint">GET /api/news</div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Powered by Node.js | Deployed on Railway
          </p>
          <span class="badge">Production</span>
        </div>
      </body>
      </html>
    `);
  } else if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'Hema News Agency',
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/api/news' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      news: [
        { id: 1, title: 'Latest News Update', date: new Date().toISOString() },
        { id: 2, title: 'Breaking News', date: new Date().toISOString() },
        { id: 3, title: 'In Depth Analysis', date: new Date().toISOString() }
      ]
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

