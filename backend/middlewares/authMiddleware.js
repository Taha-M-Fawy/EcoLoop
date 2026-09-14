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

      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'غير مصرح، الـ Token غير صالح' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح، لا يوجد Token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك الصلاحية للوصول لهذا المسار' });
    }

    next();
  };
};

module.exports = { protect, authorize };