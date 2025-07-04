
const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res, next) => {
  console.log('Checking authentication...');
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Plockar ut efter "Bearer "

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    console.log('Token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifiera token

    req.user = decoded;

    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = requireAuth;