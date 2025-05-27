const Review = require('./ReviewModel');
const User = require('../user/UserModel');

exports.createReview = async ({ _id, sparePartId, rating, comment, images }) => {
  const user = await User.findById(_id).select('name image.path');

  if (!user) {
    throw new Error('User not found');
  }

  return await Review.create({
    userName: user.name,
    userImage: { path: user.image?.path || '' },
    sparePartId,
    rating,
    comment,
    images
  });
};
