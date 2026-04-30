const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("Auth failed: No Bearer token provided");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.warn("Auth failed: Token missing from header");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const secret = process.env.JWT_SECRET || 'your_secret';
    const decoded = jwt.verify(token, secret);
    
    if (!decoded || !decoded.id) {
      console.error("Auth failed: Invalid token payload (missing ID)");
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};