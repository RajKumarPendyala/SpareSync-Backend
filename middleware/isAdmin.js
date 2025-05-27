const User = require('../app/user/UserModel');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  } catch (err) {
    next(err);
  }
};

module.exports = isAdmin;