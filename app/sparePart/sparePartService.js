const SparePart = require('./SparePartModel');
const Review = require('../review/ReviewModel');


exports.createSparePart = async ( addFields ) => {
  return await new SparePart(addFields).save();
};

exports.findByIdAndUpdate = async(filter, updateFields, projection = null) => {
    return await SparePart.findByIdAndUpdate(
        filter,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select(projection);
}

exports.find = async (filter, projection = null) => {
  const spareParts = await SparePart.find( filter ).sort({ createdAt: -1 }).select(projection);

  return await Promise.all(
    spareParts.map(async (part) => {
      const reviews = await Review.find({ sparePartId: part._id }).sort({ createdAt: -1 })
        .select('-__v -updatedAt');

      const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      return {
        ...part.toObject(),
        reviews,
        reviews,
        averageRating: parseFloat(averageRating.toFixed(1))
      };
    })
  );  
}