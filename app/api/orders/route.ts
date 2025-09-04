import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Trade from "@/models/Trade";
import redis from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type ExtendedSession = {
  user?: SessionUser;
};

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as ExtendedSession;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const { stockId, type, quantity, price } = await req.json();
  if (!stockId || !type || !quantity || !price) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!session.user || !session.user.id) {
    return NextResponse.json({ error: "Invalid session user" }, { status: 400 });
  }

  // 1️⃣ Save order to MongoDB
  const timestamp = Date.now();
  const newOrder = await Order.create({
    userId: session.user.id,
    stockId,
    type,
    quantity,
    price,
    status: "PENDING",
    timestamp, // store original timestamp
  });

  // 2️⃣ Add order to Redis
  const key = `stock:${stockId}:${type}`;
  let score: number;
  if (type === "BUY") score = price * 1e6 - timestamp;
  else score = price * 1e6 + timestamp;

  await redis.zadd(key, score, JSON.stringify({
    orderId: newOrder._id.toString(),
    userId: session.user.id,
    quantity,
    price,
    timestamp, // save original timestamp
  }));

  // 3️⃣ Match orders
  const oppositeKey = type === "BUY" ? `stock:${stockId}:SELL` : `stock:${stockId}:BUY`;

  while (true) {
    const topBuyRaw = await redis.zrevrange(`stock:${stockId}:BUY`, 0, 0);
    const topSellRaw = await redis.zrange(`stock:${stockId}:SELL`, 0, 0);

    if (!topBuyRaw.length || !topSellRaw.length) break;

    const topBuy = JSON.parse(topBuyRaw[0]);
    const topSell = JSON.parse(topSellRaw[0]);

    if (topBuy.price < topSell.price) break; // no match possible

    // Determine trade quantity
    const tradeQty = Math.min(topBuy.quantity, topSell.quantity);
    const tradePrice = topSell.price;

    // 4️⃣ Save trade in MongoDB
    await Trade.create({
      buyOrderId: topBuy.orderId,
      sellOrderId: topSell.orderId,
      stockId,
      quantity: tradeQty,
      price: tradePrice,
    });

    // 5️⃣ Update quantities
    topBuy.quantity -= tradeQty;
    topSell.quantity -= tradeQty;

    // Remove or update BUY order
    await redis.zrem(`stock:${stockId}:BUY`, topBuyRaw[0]);
    if (topBuy.quantity > 0) {
      const buyScore = topBuy.price * 1e6 - topBuy.timestamp; // use original timestamp
      await redis.zadd(`stock:${stockId}:BUY`, buyScore, JSON.stringify(topBuy));
      await Order.findByIdAndUpdate(topBuy.orderId, { quantity: topBuy.quantity, status: "PARTIAL" });
    } else {
      await Order.findByIdAndUpdate(topBuy.orderId, { status: "COMPLETED" });
    }

    // Remove or update SELL order
    await redis.zrem(`stock:${stockId}:SELL`, topSellRaw[0]);
    if (topSell.quantity > 0) {
      const sellScore = topSell.price * 1e6 + topSell.timestamp; // use original timestamp
      await redis.zadd(`stock:${stockId}:SELL`, sellScore, JSON.stringify(topSell));
      await Order.findByIdAndUpdate(topSell.orderId, { quantity: topSell.quantity, status: "PARTIAL" });
    } else {
      await Order.findByIdAndUpdate(topSell.orderId, { status: "COMPLETED" });
    }
  }

  return NextResponse.json({ message: "Order placed and matched if possible", order: newOrder });
}
