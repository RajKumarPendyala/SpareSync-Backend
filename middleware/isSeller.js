const User = require('../app/user/UserModel');

const isSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === 'seller') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Seller only.' });
  } catch (err) {
    next(err);
  }
};

module.exports = isSeller;