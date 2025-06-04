// CORS configuration
const cors = require("cors");

const corsOptions = {
  origin: true, // Allow all origins for LAN usage
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

module.exports = cors(corsOptions);
