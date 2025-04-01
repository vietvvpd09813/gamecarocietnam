// Import server file
const app = require('../server');

// Export as a Vercel serverless function
module.exports = (req, res) => {
  // Xử lý CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Xử lý OPTIONS (preflight request)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    console.log("Socket.IO API route called:", req.url);
    // Xử lý yêu cầu bằng server Express
    return app(req, res);
  } catch (error) {
    console.error("Error in Socket.IO API route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}; 