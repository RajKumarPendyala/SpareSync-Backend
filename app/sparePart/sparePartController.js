const SparePart = require('./SparePartModel');
const { deleteUploadedFile } = require('../../utils/fileCleanup');
const { createSparePart, findByIdAndUpdate, find } = require('./sparePartService');


exports.addSparePart = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      quantity,
      weight,
      dimension,
      color,
      brand,
      gadgetType,
      warrentyPeriod
    } = req.body;
    const addedBy = req.user?._id;
    const imagePaths = req.files?.length ? req.files?.map(file => ({ path: `/uploads/${file.filename}` })) : [];

    const addFields = {};

    if (name) addFields.name = name;
    if (description) addFields.description = description;
    if (price) addFields.price = price;
    if (discount) addFields.discount = discount;
    if (quantity) addFields.quantity = quantity;
    if (weight) addFields.weight = weight;
    if (dimension) addFields.dimension = dimension;
    if (color) addFields.color = color;
    if (brand) addFields.brand = brand;
    if (gadgetType) addFields.gadgetType = gadgetType;
    if (warrentyPeriod) addFields.warrentyPeriod = warrentyPeriod;
    if (addedBy) addFields.addedBy = addedBy;
    if (imagePaths.length) addFields.images = imagePaths;

    await  createSparePart(addFields);
    
    res.status(201).json({
      message: 'Added spare part successfully'
    });

  } catch (error) {
    if(req.file?.length) deleteUploadedFile(req.file);
    next(error)
  }
};


exports.editSparePartById = async (req, res, next) => {
    try{
        const {
            _id,
            name,
            description,
            price,
            discount,
            quantity,
            weight,
            dimension,
            color,
            brand,
            gadgetType,
            warrentyPeriod,
            isDeleted
        } = req.body;
        const imagePaths = req.files?.map(file => ({ path: `/uploads/${file.filename}` }));

        const updateFields = {};

        if (name) updateFields.name = name;
        if (description) updateFields.description = description;
        if (price) updateFields.price = price;
        if (discount) updateFields.discount = discount;
        if (quantity) updateFields.quantity = quantity;
        if (weight) updateFields.weight = weight;
        if (dimension) updateFields.dimension = dimension;
        if (color) updateFields.color = color;
        if (brand) updateFields.brand = brand;
        if (gadgetType) updateFields.gadgetType = gadgetType;
        if (warrentyPeriod) updateFields.warrentyPeriod = warrentyPeriod;
        if (imagePaths?.length) updateFields.images = imagePaths;
        if (isDeleted !== undefined) updateFields.isDeleted = isDeleted;

        const updatedSparePart = await findByIdAndUpdate(
            _id,
            updateFields,
            '-_id -addedBy -createdAt -updatedAt -__v'
        ); 

        if (updatedSparePart.isDeleted){
            return res.status(200).json({
                message: 'Spare part deleted successfully'
            })
        }

        res.status(200).json({
            message: 'Spare part edited successfully',
            SparePart : updatedSparePart
        });

    }catch (error) {
        if(req.file?.length) deleteUploadedFile(req.file);
        next(error);
    }
};


// exports.getSparePartsWithFilter = async (req, res, next) => {
//     try{
//         const { gadgetType, brand } = req.body;
//         const addedBy = req.user?._id || null;
//         const role = req.user?.role || null;

//         let filterSpareParts = {};

//         if (brand) filterSpareParts.brand = brand;
//         if (gadgetType) filterSpareParts.gadgetType = gadgetType;
//         if(role === "seller"){
//             if (addedBy) filterSpareParts.addedBy = addedBy;
//         }
//         filterSpareParts.isDeleted = false;

//         const spareParts = await find(
//             filterSpareParts,
//             '-createdAt -updatedAt -__v'
//         );

//         res.status(200).json({
//             message: 'Spare parts fetched successfully',
//             SpareParts : spareParts || []
//         });

//     }catch (error) {
//         next(error);
//     }
// }



exports.getSparePartsWithFilter = async (req, res, next) => {

    try{
        const addedBy = req.user?._id || null;
        const role = req.user?.role || null;

        let filterSpareParts = {};

        if(role === "seller"){
            if (addedBy) filterSpareParts.addedBy = addedBy;
        }
        filterSpareParts.isDeleted = false;

        const spareParts = await find(
            filterSpareParts,
            '-createdAt -updatedAt -__v'
        );

        res.status(200).json({
            message: 'Spare parts fetched successfully',
            SpareParts : spareParts || []
        });

    }catch (error) {
        next(error);
    }
}