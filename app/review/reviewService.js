const Review = require('./ReviewModel');
const User = require('../user/UserModel');

exports.createReview = async ({ _id, sparePartId, rating, comment, images }) => {
  const user = await User.findById(_id).select('name image.path');

  if (!user) {
    throw new Error('User not found');
  }

  const defaultImage = 'https://res.cloudinary.com/dxcbw424l/image/upload/v1749116154/rccjtgfk1lt74twuxo3b.jpg';

  return await Review.create({
    userName: user.name,
    userImage: { path: user.image?.path || defaultImage },
    sparePartId,
    rating,
    comment,
    images
  });
};
