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
    const spareParts = await SparePart.find( filter ).select(projection);

    return await Promise.all(
        spareParts.map(async (part) => {
          const reviews = await Review.find({ sparePartId: part._id })
            .select('-__v -updatedAt');
          return {
            ...part.toObject(),
            reviews
          };
        })
    );  
}