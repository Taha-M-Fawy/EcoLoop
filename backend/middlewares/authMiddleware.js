const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'ecoloop_super_secret_key_2026'
      );

      req.user = {
        ...decoded,
        id: decoded.id || decoded._id,
        _id: decoded._id || decoded.id
      };
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized, no token provided' });
  }
};

const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'ecoloop_super_secret_key_2026'
      );
      req.user = {
        ...decoded,
        id: decoded.id || decoded._id,
        _id: decoded._id || decoded.id
      };
    } catch {
      req.user = null;
    }
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this route' });
    }

    next();
  };
};

module.exports = { protect, optionalProtect, authorize };