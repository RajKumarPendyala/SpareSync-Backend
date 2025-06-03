const Cart = require('./CartModel');
const mongoose = require('mongoose');
const SparePart = require('../sparePart/SparePartModel');

exports.findSparePart = async (filter, projection = null) => {
    return await SparePart.findOne( filter ).select(projection);
}

exports.findCart = async (filter, projection = null) => {
    return await Cart.findOne( filter ).select(projection);
}

exports.getCart = async (filter, projection = null) => {
    return await Cart.findOne(filter)
        .select(projection)
        .populate('items.sparePartId');  // Populate sparePartId to get full part info
};

exports.createCart = async (userId, sparePartId, sparePart) => {
    const cart = new Cart({
        userId,
        items: [{
          sparePartId,
          subTotal : sparePart.price,
          subTotalDiscount: mongoose.Types.Decimal128.fromString(
             ((parseFloat(sparePart.price?.toString() || '0') * parseFloat(sparePart.discount?.toString() || '0')) / 100).toFixed(2)
            ) 
        }],
        totalAmount: sparePart.price,
        discountAmount: mongoose.Types.Decimal128.fromString(
            ((parseFloat(sparePart.price?.toString() || '0') * parseFloat(sparePart.discount?.toString() || '0')) / 100).toFixed(2)
           ) 
    });
    return await cart.save();
}

exports.findItem = ( cart, sparePartId ) => {
    return cart.items.find(item => item.sparePartId == sparePartId);
}

exports.removeItemFromCart = async(userId, sparePartId, projection) => {
    const cart =  await Cart.findOneAndUpdate(
        { userId },
        {
            $pull: { items: { sparePartId } }
        },
        { new: true, runValidators: true }
    ).select(projection);

    if (!cart) throw new Error('Cart not found');

    let totalAmount = 0;
    let discountAmount = 0;

    cart.items.forEach(item => {
        totalAmount += parseFloat(item.subTotal?.toString() || '0');
        if (item.subTotalDiscount)
        discountAmount += parseFloat(item.subTotalDiscount?.toString() || '0');
    });

    cart.totalAmount = totalAmount;
    cart.discountAmount = discountAmount;
    await cart.save();

    return cart;
}



exports.updateCartItemQuantity = async(userId, sparePartId, quantity) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");
  
    const itemIndex = cart.items.findIndex(item =>
       item.sparePartId.toString() === sparePartId.toString()
    );      
  
    if (itemIndex === -1) throw new Error("Item not found in cart");
  
    const sparePart = await SparePart.findById(sparePartId);
    if (!sparePart) throw new Error("Spare part not found");
  
    const price = parseFloat(sparePart.price.toString() || '0');
    const discount = parseFloat(sparePart.discount?.toString() || '0');

    const subTotal = price * quantity;
    const subTotalDiscount = ((price * discount) / 100) * quantity;    
  
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subTotal = mongoose.Types.Decimal128.fromString(subTotal.toFixed(2));
    cart.items[itemIndex].subTotalDiscount = mongoose.Types.Decimal128.fromString(subTotalDiscount.toFixed(2));    
  
    let totalAmount = 0;
    let discountAmount = 0;
  
    cart.items.forEach(item => {
      totalAmount += parseFloat(item.subTotal.toString());
      discountAmount += parseFloat(item.subTotalDiscount?.toString() || '0');
    });
  
    cart.totalAmount = mongoose.Types.Decimal128.fromString(totalAmount.toFixed(2));
    cart.discountAmount = mongoose.Types.Decimal128.fromString(discountAmount.toFixed(2));
  
    await cart.save();
    return cart;
}
