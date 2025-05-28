const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
const { deleteUploadedFile } = require('../../utils/fileCleanup');
const { emailOTP } = require('../../utils/emailOTP');
const { verifyPassword } = require('../../utils/verifyPassword');
const { findByPhoneNumber, updateOne, findByEmail, findById, findAndUpdate, findByRole, createUser, findBy, updateOneSet, findOneAndUpdate } = require('./userService');


exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      password,
      role
    } = req.body;

    if (!name || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if ( !( role === "buyer" || role === "seller" ) ) {
      return res.status(400).json({ message: 'Role must be "seller" or "buyer".' });
    }
    
    const existingUser = await findByPhoneNumber({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const updateFields = { name, phoneNumber, passwordHash, role};

    const filter = {
      isVerified : true,
      email
    }

    const removeFields = {
      resetTokenExpires : "",
      token : ""
    }

    const result = await findOneAndUpdate(
      filter,
      updateFields,
      removeFields
    );

    if (result) {
      const token = jwt.sign(
        { userId: result._id, role: result.role },
        JWT_SECRET,
        { expiresIn: '10d' }
      );
  
      if (token){
        return res.status(200).json({
          message: 'User registered successfully.',
          token,
          role : result.role
        });
      }
    }

    return res.status(500).json({ message: 'User could not be registered. Please try again.'});
  } catch (err) {
    next(err);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findByEmail(
      { email },
      '_id name passwordHash role image.path isverified'
    );
    
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '10d' }
    );

    if (token){
      return res.status(200).json({
        message: 'Login successful',
        token,
        role : user.role
      });
    }
    return res.status(500).json({message: 'Login failed.'});
  } catch (err) {
    next(err);
  }
};


exports.getProfileById = async (req, res, next) => {
  try{
    const _id = req.user?._id;

    if (!_id) {
      return res.status(401).json({ message: 'Unauthorized: No user ID.' });
    }

    const user = await findById(
      { _id },
      '-_id -passwordHash -isVerified -token -resetTokenExpires -createdAt -updatedAt -__v'
    );

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }
  
    return res.status(200).json({
      user
    });  
  } catch (err) {
    next(err);
  }
}


exports.editProfileById = async (req, res, next) => {
  try{
    const _id = req.user?._id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const {
      name,
      email,
      phoneNumber,
      role,
      houseNo,
      street,
      postalCode,
      city,
      state,
      isDeleted
    } = req?.body?.updateData;

    const updateFields = { isVerified : true };

    if (name) updateFields.name = name;
    if (imagePath) updateFields.image = { path: imagePath };
    if (email) updateFields.email = email;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (role) updateFields.role = role;
    if (isDeleted !== undefined) updateFields.isDeleted = isDeleted;

    const address = {};
    if (houseNo) address.houseNo = houseNo;
    if (street) address.street = street;
    if (postalCode) address.postalCode = postalCode;
    if (city) address.city = city;
    if (state) address.state = state;
    
    if (Object.keys(address).length > 0) {
      updateFields.address = address;
    }

    const updatedUser = await findAndUpdate(
      _id,
      updateFields,
      '-_id -passwordHash -isVerified -token -resetTokenExpires -createdAt -updatedAt -__v'
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    if (updatedUser.isDeleted){
      return res.status(410).json({
          message: 'Profile has been deleted.'
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully.',
      user : updatedUser
    });
  } catch (err) {
    if(req.file) deleteUploadedFile(req.file);
    next(err);
  }
};


exports.getUsersWithFilter = async (req, res, next) => {
  try {
    const { role } = req.body;

    const filter = {
      isDeleted: false,
      isVerified: true
    };

    if (role) filter.role = role;

    const users = await findByRole(
      filter,
      '-passwordHash -token -resetTokenExpires -__v'
    );

    if(users){
      return res.status(200).json({
        message: 'Users fetched successfully.',
        users : users
      });
    }
    return res.status(400).json({ message: 'Users failed to fetch.' });
  } catch (err) {
    next(err);
  }
};


exports.editUserById = async(req, res, next) => {
  try{
    const { _id, isDeleted } = req.body;

    const updatedUser = await findByAndUpdate(
      _id,
      { isDeleted },
      '-_id -passwordHash -token -resetTokenExpires -__v'
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (updatedUser.isDeleted){
      return res.status(410).json({
          message: 'User deleted successfully.'
      });
    }

    return res.status(200).json({
      message: 'User updated successfully.',
      user : updatedUser
    });
  } catch (err) {
    next(err);
  }
};


exports.sendOtpToEmail = async(req, res, next) => {
  try{
    const {email} = req.body;

    const existingUser = await findByEmail({ email });
    
    if (existingUser && existingUser.isVerified) { 
    return res.status(400).json({ message: 'Email already exists.' });
    }

    const token = await emailOTP(email);
    
    if(!token) {
      res.status(500).json({ message: 'Failed to send OTP.' });
    }
    
    const resetTokenExpires = new Date(Date.now() + 2 * 60 * 1000);
    
    if (existingUser){
      let result;
      
      if(!existingUser.isVerified){
        result = updateOneSet(
          { email }, 
          { 
            token,
            resetTokenExpires
          } 
        );
      }
      
      if(result) return res.status(200).json({ message: 'OTP sent successfully.' });
    }

    const result = await createUser(email, token, resetTokenExpires);

    if(result) return res.status(200).json({ message: 'OTP sent successfully.' });
    return res.status(400).json({ message: 'Failed to sent OTP.' });
  }catch (error) {
    next(err);
  }
}


exports.forgetPasswordOTP = async(req, res, next) => {
  try{
    const {email} = req.body;

    const user = await findByEmail({ email });

    if (!user) return res.status(404).json({ message: "Email doesn't exists." });
    
    const otp = await emailOTP(email);

    if(!otp) {
      res.status(500).json({ message: 'Failed to send OTP.' });
    }

    const result = await updateOneSet(
      { email }, 
      { 
        token : otp,
        resetTokenExpires: new Date(Date.now() + 2 * 60 * 1000)
      } 
    );

    if(result.modifiedCount > 0) return res.status(200).json({ message: 'OTP sent successfully.' });
    return res.status(400).json({ message: 'Failed to sent OTP.' });
  }catch (error) {
    next(err);
  }
}


exports.updateUserPassword = async(req, res, next) => {
  try{
    const _id = req.user?._id;
    const {
      email,
      otp,
      currentPassword,
      newPassword
    } = req.body;

    const user = await findBy(
      { $or: [{ _id }, { email }] },
      'passwordHash token resetTokenExpires'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if(currentPassword) {
      const isMatch = verifyPassword(currentPassword, user.passwordHash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if(otp){
      const currentDate = new Date();
      if ( otp != user.token || user.resetTokenExpires < currentDate) {
        return res.status(400).json({ message: 'Invalid OTP or OTP expried.' });
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const removeFields = {
      resetTokenExpires : "",
      token : ""
    }

    const result = await updateOne(
      { $or: [{ _id }, { email }] },
      { passwordHash },
      removeFields
    );
    if(result.modifiedCount > 0) return res.status(200).json({ success: true, message: 'User password updated successfully.' });
    return res.status(400).json({ message: 'User password failed to update.' });
  }catch (error) {
    next(error);
  }
}


exports.verifyEmail = async(req, res, next) => {
  try{
    const {email, otp} = req.body;

    const user = await findByEmail(
      { email },
      'token resetTokenExpires'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDate = new Date();
    if ( otp != user.token || user.resetTokenExpires < currentDate) {
      return res.status(400).json({ message: 'Invalid OTP or OTP expried.' });
    }

    const result = await updateOneSet(
      { email },
      { isVerified : true }
    );

    if(result.modifiedCount > 0) return res.status(201).json({success: true, message: 'Email verified successfully.'});
    return res.status(400).json({ message: 'Email verification failed.' });
  }catch (error){
    next(error);
  }
}