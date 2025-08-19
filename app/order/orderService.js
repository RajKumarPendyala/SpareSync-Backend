const Cart = require('../cart/CartModel');
const Order = require('./OrderModel');
const SparePart = require('../sparePart/SparePartModel');
const FinancialReport = require('../financialReport/FinancialReportModel');
const mongoose = require('mongoose');
const User = require('../user/UserModel');
const adminId = process.env.ADMIN_USER_ID;

exports.placeOrderFromCart = async (session, userId, paymentMethod, transactionId) => {

  const cart = await Cart.findOne({ userId }).session(session);
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error('Cart is empty or not found');
  }

  const fAmount = (
    parseFloat(cart.totalAmount?.toString() || "0") -
    parseFloat(cart.discountAmount?.toString() || "0")
  ).toFixed(2);

  await transaction(session, userId, adminId, fAmount);

  const orderData = {
    userId,
    items: cart.items.map(item => ({
      sparePartId: item.sparePartId,
      quantity: item.quantity,
      subTotal: item.subTotal || 0,
      subTotalDiscount: item.subTotalDiscount || 0
    })),
    paymentMethod,
    transactionId,
    totalAmount: cart.totalAmount || 0,
    discountAmount: cart.discountAmount || 0,
    finalAmount: fAmount
  };

  const order = await Order.create([orderData], { session }); // use array when using session

  for (const item of cart.items) {
    await SparePart.findByIdAndUpdate(
      item.sparePartId,
      { $inc: { quantity: -item.quantity } },
      { session, new: true, runValidators: true }
    );
  }

  // await broadcastSpareParts(req.app.get('io'));

  await Cart.deleteOne({ userId }).session(session);

  return order[0]; // since we used create([...])
};



exports.getOrdersByUser = async(userId, shipmentStatus) => {
  const filter = {};
  if (shipmentStatus) {
    filter.shipmentStatus = shipmentStatus;
  }
  if (userId) {
    filter.userId = userId;
  }
 
  return await Order.find(filter).select('-userId -__v').sort({ createdAt: -1 }).populate('items.sparePartId'); 
}


exports.cancelOrder = async(session, userId, orderId, req) => {
  const order = await Order.findOne({ _id: orderId, userId }).session(session);

  if (!order) {
    throw new Error('Order not found or does not belong to the user');
  }

  if (['shipped', 'delivered', 'cancelled'].includes(order.shipmentStatus)) {
    throw new Error(`Cannot cancel order that is already ${order.shipmentStatus}`);
  }

  const fAmount = order.finalAmount;

  await transaction(session, adminId, userId, fAmount);

  for (const item of order.items) {
    await SparePart.findByIdAndUpdate(
      item.sparePartId,
      { $inc: { quantity: item.quantity } },
      { session, new: true, runValidators: true }
    );
  }

  order.shipmentStatus = 'cancelled';
  await order.save({ session });

  return order;
}


exports.getPlatformOrders = async(shipmentStatus) => {
  const filter = {};
  if (shipmentStatus) {
    filter.shipmentStatus = shipmentStatus;
  }

  const orders = await Order.find(filter).select('-userId -__v').sort({ createdAt: -1 }).populate('items.sparePartId userId'); 

  return orders;
}



exports.updateOrderStatus = async(session, orderId, shipmentStatus) => {
  const order = await Order.findById(orderId).session(session);
  if (!order) throw new Error("Order not found");

  order.shipmentStatus = shipmentStatus;
  await order.save({session});

  if (shipmentStatus === "cancelled") {
    const fAmount = order.finalAmount;
    const userId = order.userId;
    await transaction(session, adminId, userId, fAmount);
  }

  if (shipmentStatus === "delivered" ) {

    const totalAmount = parseFloat(order.totalAmount?.toString() || "0");
    const discount = parseFloat(order.discountAmount?.toString() || "0");
    const netProfit = totalAmount - discount;

    await FinancialReport.create([{
      totalSales: totalAmount,
      totalOrders: 1,
      netProfit
    }], { session });

    for (const item of order.items) {
      const sparePart = await SparePart.findById(item.sparePartId).select('addedBy price discount').session(session);;

      if (!sparePart || !sparePart.addedBy) continue;

      const sellerId = sparePart.addedBy.toString();
      const quantity = item.quantity || 0;
      const price = parseFloat(sparePart.price?.toString() || "0");
      const discount = parseFloat(sparePart.discount?.toString() || "0");

      const total = parseFloat((price * (1 - discount / 100)).toFixed(2));

      const grossAmount = quantity * total;
      const platformFee = grossAmount * 0.10;
      const sellerAmount = parseFloat((grossAmount - platformFee).toFixed(2));

      await transaction(session, adminId, sellerId, sellerAmount);
    }
  }
  return order;
}




const transaction = async (session, senderId, receiverId, amount) => {

  const { Decimal128 } = mongoose.Types;

  const sender = await User.findById(senderId).session(session);
  const receiver = await User.findById(receiverId).session(session);

  if (!sender || !receiver) {
    throw new Error('Sender or Receiver not found');
  }

  const senderWallet = parseFloat(sender.walletAmount.toString());
  const receiverWallet = parseFloat(receiver.walletAmount.toString());
  const debitAmount = parseFloat(amount);

  if (senderWallet < debitAmount) {
    throw new Error('Insufficient wallet balance');
  }

  sender.walletAmount = Decimal128.fromString((senderWallet - debitAmount).toFixed(2));
  receiver.walletAmount = Decimal128.fromString((receiverWallet + debitAmount).toFixed(2));

  await sender.save({ session });
  await receiver.save({ session });
}