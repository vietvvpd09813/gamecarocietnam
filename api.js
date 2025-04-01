const app = require('./server');

module.exports = (req, res) => {
  // Đảm bảo rằng Vercel có thể xử lý tất cả các yêu cầu
  console.log("API request:", req.url);
  return app(req, res);
}; 