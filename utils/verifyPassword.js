const bcrypt = require('bcrypt');

exports.verifyPassword = async (password, passwordHash) => {
    return  isMatch = await bcrypt.compare(password, passwordHash);
}