// Middleware xử lý CORS cho API routes
module.exports = (req, res, next) => {
  // Cấu hình CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Trả về ngay nếu là preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Chuyển tới handler tiếp theo
  return next();
}; 