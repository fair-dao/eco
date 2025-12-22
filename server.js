const http = require('http');
const fs = require('fs');
const path = require('path');

// 服务器配置
const PORT = 8080;
const HOST = '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'app');

// 支持的文件类型和MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url} by method ${req.method}`);
  
  // 处理根路径请求，重定向到index.html
  // 从URL中分离出路径部分，忽略查询参数
  const pathname = req.url.split('?')[0];
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // 检查文件是否存在
  fs.exists(filePath, (exists) => {
    if (!exists) {
      // 文件不存在，返回404错误
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`<h1>Not Found</h1><p>The requested URL ${req.url} was not found on this server.</p>`);
      return;
    }
    
    // 检查是否为目录，如果是，尝试提供index.html
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      
      // 检查目录中是否存在index.html
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>Not Found</h1><p>No index.html found in ${req.url}</p>`);
        return;
      }
    }
    
    // 确定文件的MIME类型
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // 读取并提供文件
    fs.readFile(filePath, (error, content) => {
      if (error) {
        // 读取文件出错，返回500错误
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      } else {
        // 成功读取文件，设置正确的MIME类型并返回内容
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

// 启动服务器
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`Serving files from ${PUBLIC_DIR}`);
});

// 处理服务器错误
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});