// Import server file
const app = require('../server');

// Export as a Vercel serverless function
module.exports = (req, res) => {
  // Cho phép CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    // Pre-flight request
    res.status(200).end();
    return;
  }
  
  // Chuyển tiếp tất cả các yêu cầu Socket.IO đến máy chủ Express
  return app(req, res);
}; 