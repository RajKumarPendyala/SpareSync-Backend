const { createReview } = require('./reviewService');
const { deleteUploadedFile } = require('../../utils/fileCleanup');

exports.createReview = async (req, res, next) => {
  try {
    const userId = req.user?._id; 
    const { sparePartId, rating, comment, imagePaths} = req.body;
    // const imagePaths = req.files?.length ? req.files?.map(file => ({ path: `/uploads/${file.filename}` })) : [];

    const review = await createReview({
      _id : userId,
      sparePartId,
      rating,
      comment,
      images: imagePaths
    });

    if(review){
        return res.status(201).json({
            message: 'Review submitted successfully'
        });
    }
    if(req.file?.length) deleteUploadedFile(req.file);
    res.status(400).json({
        message: 'Failed to submit review',
    });

  } catch (error) {
    if(req.file?.length) deleteUploadedFile(req.file);
    next(error);
  }
};