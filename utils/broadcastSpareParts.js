const SparePart = require('../app/sparePart/SparePartModel');

exports.broadcastSpareParts = async (io) => {
  const spareParts = await SparePart.find({ isDeleted: false }).select('-createdAt -updatedAt -__v');
  io.emit('sparePart', { sparepart: spareParts || [] });
};