const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        "_id" : decoded.userId,
        "role" : decoded.role
      };

      return next();
    } catch (error) {
      next(error);
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


module.exports = authMiddleware;