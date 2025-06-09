const Cart = require('../cart/CartModel');
const Order = require('./OrderModel');
const SparePart = require('../sparePart/SparePartModel');
const FinancialReport = require('../financialReport/FinancialReportModel');

exports.placeOrderFromCart = async(userId, paymentMethod, transactionId) => {
  const cart = await Cart.findOne({ userId }).lean(); // gets a plain js obj, not a Mongoose doc

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error('Cart is empty or not found');
  }

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
    finalAmount: (parseFloat(cart.totalAmount?.toString() || "0") - parseFloat(cart.discountAmount?.toString() || "0")).toFixed(2)
  };

  const order = await Order.create(orderData);

  await Cart.deleteOne({ userId });

  return order;
}


exports.getOrdersByUser = async(userId) => {
    return await Order.find({ userId }).select('-userId -__v').sort({ createdAt: -1 }).populate('items.sparePartId'); 
}


exports.cancelOrder = async(userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    throw new Error('Order not found or does not belong to the user');
  }

  if (['shipped', 'delivered', 'cancelled'].includes(order.shipmentStatus)) {
    throw new Error(`Cannot cancel order that is already ${order.shipmentStatus}`);
  }

  order.shipmentStatus = 'cancelled';
  await order.save();

  return order;
}


exports.getPlatformOrders = async(shipmentStatus) => {
  const filter = {};
  if (shipmentStatus) {
    filter.shipmentStatus = shipmentStatus;
  }

  const orders = await Order.find(filter).select('-userId -__v').sort({ createdAt: -1 });

  return orders;
}



exports.updateOrderStatus = async(orderId, shipmentStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.shipmentStatus = shipmentStatus;
  await order.save();

  if (shipmentStatus === "shipped" || shipmentStatus === "delivered" ) {
    for (const item of order.items) {
      await SparePart.findByIdAndUpdate(
        item.sparePartId,
        { $inc: { quantity: -item.quantity } },
        { new: true, runValidators: true }
      );
    }

    const totalAmount = parseFloat(order.totalAmount?.toString() || "0");
    const discount = parseFloat(order.discountAmount?.toString() || "0");
    const netProfit = totalAmount - discount;

    await FinancialReport.create({
      totalSales: totalAmount,
      totalOrders: 1,
      netProfit
    });
  }
  return order;
}