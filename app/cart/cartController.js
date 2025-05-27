const mongoose = require('mongoose');
const { findSparePart, createCart, findCart, findItem, removeItemFromCart, updateCartItemQuantity } = require('./cartService');


exports.addItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { sparePartId } = req.body;

    const sparePart = await findSparePart({ _id : sparePartId });
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found.' });
    }

    let cart = await findCart({ userId });

    if (!cart) {
      cart = await createCart(userId, sparePartId, sparePart);
    } else {
      const existingItem = findItem( cart, sparePartId );

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subTotal = mongoose.Types.Decimal128.fromString(
          (parseFloat(sparePart.price?.toString() || '0') * existingItem.quantity).toFixed(2)
        );
        existingItem.subTotalDiscount = mongoose.Types.Decimal128.fromString(
          (parseFloat(sparePart.discount?.toString() || '0') * existingItem.quantity).toFixed(2)
        );
      } 
      else {
        cart.items.push({
          sparePartId,
          quantity: 1,
          subTotal : sparePart.price,
          subTotalDiscount: sparePart.discount || 0 
        });
      }

      cart.totalAmount = mongoose.Types.Decimal128.fromString(
        cart.items.reduce((sum, item) => sum + parseFloat(item.subTotal?.toString() || '0'), 0).toFixed(2)
      );
      cart.discountAmount = mongoose.Types.Decimal128.fromString(
        cart.items.reduce((sum, item) => sum + parseFloat(item.subTotalDiscount?.toString() || '0'), 0).toFixed(2)
      );

      cart.markModified('items');
    }

    await cart.save();

    res.status(200).json({ message: 'Item added to cart successfully.' });

  } catch (error) {
    next(error);
  }
};



exports.getItems = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    let cartData = await findCart(
      { userId },
      '-_id -userId -__v'
    );

    if(cartData){
      return res.status(200).json({
        message: 'Cart data fetched successfully.',
        cartData
      });
    }
    
    res.status(400).json({
      message: 'Failed to fetch cart data.',
    });

  } catch (error) {
    next(error);
  }
}


exports.removeItems = async(req, res, next) => {
  try {
    const userId = req.user._id;
    const { sparePartId } = req.body;

    const result = await removeItemFromCart(
      userId, 
      sparePartId,
      '-userId -__v'
    );

    if(result) {
      return res.status(200).json({
        message: 'Item removed from cart',
        data: result
      });
    }
    res.status(400).json({
      message: 'Failed to remove item from cart.'
    });
  } catch (error) {
    next(error);
  }
}


exports.updateItem = async(req, res, next) => {
  try {
    const userId = req.user?._id;
    const { sparePartId, quantity } = req.body;

    const updatedCart = await updateCartItemQuantity(userId, sparePartId, quantity);

    if(updatedCart){
      return res.status(200).json({
        message: 'Cart item updated',
        data: updatedCart
      });
    }
    res.status(400).json({
      message: 'Failed to update cart item.'
    });
  } catch (error) {
    next(error);
  }
}