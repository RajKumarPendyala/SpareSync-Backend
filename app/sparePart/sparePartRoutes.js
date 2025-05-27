const express = require('express');
const router = express.Router();

const sparePartController = require('./sparePartController');
const isSeller = require('../../middleware/isSeller');
const isAdmin = require('../../middleware/isAdmin');
const authMiddleware = require('../../middleware/authMiddleware');
const upload = require('../../middleware/upload');


router.get('/', sparePartController.getSparePartsWithFilter);

router.get('/seller', authMiddleware, isSeller, sparePartController.getSparePartsWithFilter);
router.post('/seller', authMiddleware, isSeller, upload.array('images', 5), sparePartController.addSparePart);
router.patch('/seller', authMiddleware, isSeller, upload.array('images', 5), sparePartController.editSparePartById);

router.patch('/admin', authMiddleware, isAdmin, upload.array('images', 5), sparePartController.editSparePartById);


module.exports = router;


//test cases

//iam expecting discount amount not percentage

//adding spare part
// {
//   "name": "Samsung Galaxy Screen Replacement",
//   "description": "High-quality AMOLED screen replacement for Samsung Galaxy S10.",
//   "price": 149.99,
//   "discount": 10.00,
//   "quantity": 25,
//   "weight": 0.2,
//   "dimension": "6.1 x 3.0 x 0.3 inches",
//   "color": "Black",
//   "brand": "Samsung",
//   "gadgetType": "MobileDevices",
//   "addedBy": "645b8b2fc9e77e4a6dd8a000",
//   "warrentyPeriod": 12
// }


//update spare parts
// {
//   "_id": "6820dc83f74a26c9ff138a57",
//   "price": 300,
//   "quantity": 30,
//   "color": "Blue"
// }

//filter
// {
//     "brand": "Samsung"
// }