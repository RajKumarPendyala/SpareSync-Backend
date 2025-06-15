const User = require('./UserModel');

const findBy = async (filter, projection = null) => {
    return await User.findOne( filter ).sort({ createdAt: -1 }).select(projection);
}

exports.findByRole = async (filter, projection = null) => {
    return await User.find( filter ).sort({ createdAt: -1 }).select(projection);
}

exports.updateOne = async(filter, updateFields, removeFields) =>{
    return await User.updateOne(
        filter,
        { 
            $set: updateFields,
            $unset: removeFields
        },
        { runValidators: true }
    );
}

exports.findOneAndUpdate = async(filter, updateFields, removeFields) =>{
    return await User.findOneAndUpdate(
        filter,
        { 
            $set: updateFields,
            $unset: removeFields
        },
        { new: true, runValidators: true }
    );
}

exports.updateOneSet = async(filter, updateFields) => {
    return await User.updateOne(
        filter,
        { $set: updateFields },
        { runValidators: true }
    );
}

exports.findAndUpdate = async(filter, updateFields, projection = null) => {
    return await User.findByIdAndUpdate(
        filter,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select(projection);
}

exports.createUser = async (email, token, resetTokenExpires) => {
  return await new User({
    email,
    token,
    resetTokenExpires
  }).save(); 
};

exports.findByPhoneNumber = findBy;
exports.findByEmail = findBy;
exports.findById = findBy;
exports.findBy = findBy;