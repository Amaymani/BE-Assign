import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Trade from "@/models/Trade";
import redis from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Clear previous test orders/trades in MongoDB
    await Order.deleteMany({});
    await Trade.deleteMany({});

    // Clear Redis order book
    await redis.del("stock:TEST_STOCK:BUY");
    await redis.del("stock:TEST_STOCK:SELL");

    // Create ObjectIds for test user and stock
//     const TEST_USER_ID = new mongoose.Types.ObjectId();
//     const TEST_STOCK_ID = new mongoose.Types.ObjectId();

//     // Seed orders with different prices and timestamps
//     const ordersData = [
//       { type: "BUY", quantity: 100, price: 50, timestamp: new Date("2025-09-04T10:00:00Z") },
//       { type: "BUY", quantity: 200, price: 55, timestamp: new Date("2025-09-04T10:05:00Z") },
//       { type: "BUY", quantity: 150, price: 50, timestamp: new Date("2025-09-04T10:10:00Z") },
//       { type: "SELL", quantity: 100, price: 52, timestamp: new Date("2025-09-04T10:02:00Z") },
//       { type: "SELL", quantity: 150, price: 50, timestamp: new Date("2025-09-04T10:03:00Z") },
//     ];

//     // Insert into MongoDB
//     const orders = (await Order.insertMany(
//       ordersData.map(o => ({
//         ...o,
//         stockId: TEST_STOCK_ID,
//         userId: TEST_USER_ID,
//         status: "PENDING",
//       }))
//     ))
//     const ordersWithIds = orders.map(o => ({
//   ...o.toObject(),        // ensure it's a Mongoose document
//   _id: o._id.toString(),
//   userId: o.userId.toString(),
//   stockId: o.stockId.toString(),
//   timestamp: o.timestamp ? new Date(o.timestamp) : new Date(),
// }));

//     // Push orders to Redis sorted sets
//     for (const order of ordersWithIds) {
//       const key = `stock:TEST_STOCK:${order.type}`;
//       const ts = order.timestamp.getTime();

//       // Score calculation: BUY → higher price first, SELL → lower price first
//       const score = order.type === "BUY" ? order.price * 1e6 - ts : order.price * 1e6 + ts;

//       await redis.zadd(key, score, JSON.stringify({
//         orderId: order._id.toString(),
//         userId: order.userId.toString(),
//         quantity: order.quantity,
//         price: order.price,
//         timestamp: ts
//       }));
//     }

//     // Run matching loop
//     while (true) {
//       const topBuyRaw = await redis.zrevrange("stock:TEST_STOCK:BUY", 0, 0);
//       const topSellRaw = await redis.zrange("stock:TEST_STOCK:SELL", 0, 0);

//       if (!topBuyRaw.length || !topSellRaw.length) break;

//       const topBuy = JSON.parse(topBuyRaw[0]);
//       const topSell = JSON.parse(topSellRaw[0]);

//       if (topBuy.price < topSell.price) break;

//       const tradeQty = Math.min(topBuy.quantity, topSell.quantity);
//       const tradePrice = topSell.price;

//       // Save trade
//       const trade = await Trade.create({
//         buyOrderId: topBuy.orderId,
//         sellOrderId: topSell.orderId,
//         stockId: TEST_STOCK_ID,
//         quantity: tradeQty,
//         price: tradePrice,
//         timestamp: new Date(),
//       });

//       // Update quantities and Redis
//       topBuy.quantity -= tradeQty;
//       topSell.quantity -= tradeQty;

//       if (topBuy.quantity <= 0) {
//         await redis.zrem("stock:TEST_STOCK:BUY", topBuyRaw[0]);
//         await Order.findByIdAndUpdate(topBuy.orderId, { status: "COMPLETED" });
//       } else {
//         const score = topBuy.price * 1e6 - topBuy.timestamp;
//         await redis.zadd("stock:TEST_STOCK:BUY", score, JSON.stringify(topBuy));
//         await Order.findByIdAndUpdate(topBuy.orderId, { quantity: topBuy.quantity, status: "PARTIAL" });
//       }

//       if (topSell.quantity <= 0) {
//         await redis.zrem("stock:TEST_STOCK:SELL", topSellRaw[0]);
//         await Order.findByIdAndUpdate(topSell.orderId, { status: "COMPLETED" });
//       } else {
//         const score = topSell.price * 1e6 + topSell.timestamp;
//         await redis.zadd("stock:TEST_STOCK:SELL", score, JSON.stringify(topSell));
//         await Order.findByIdAndUpdate(topSell.orderId, { quantity: topSell.quantity, status: "PARTIAL" });
//       }
//     }

//     // Fetch final order and trade state for verification
//     const finalOrders = await Order.find({});
//     const finalTrades = await Trade.find({});

    return NextResponse.json({
      message: "Test matching completed",
      // orders: finalOrders,
      // trades: finalTrades,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error", details: err }, { status: 500 });
  }
}
