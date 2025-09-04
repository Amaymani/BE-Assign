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
  const session = await getServerSession(authOptions) as ExtendedSession;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const { stockId, type, quantity, price } = await req.json();
  if (!stockId || !type || !quantity || !price) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }


  if (!session.user || !session.user.id) {
    return NextResponse.json({ error: "Invalid session user" }, { status: 400 });
  }
  const newOrder = await Order.create({
    userId: session.user.id,
    stockId,
    type,
    quantity,
    price,
  });

  const key = `stock:${stockId}:${type}`;
  const timestamp = Date.now();


  let score: number;
  if (type === "BUY") {

    score = price * 1e6 - timestamp;
  } else {

    score = price * 1e6 + timestamp;
  }

  await redis.zadd(key, score, JSON.stringify({
    orderId: newOrder._id.toString(),
    userId: session.user.id,
    quantity,
    price,
  }));


  const oppositeKey = type === "BUY" ? `stock:${stockId}:SELL` : `stock:${stockId}:BUY`;

  while (true) {
    const topBuyRaw = await redis.zrevrange(`stock:${stockId}:BUY`, 0, 0);
    const topSellRaw = await redis.zrange(`stock:${stockId}:SELL`, 0, 0);

    if (!topBuyRaw.length || !topSellRaw.length) break;

    const topBuy = JSON.parse(topBuyRaw[0]);
    const topSell = JSON.parse(topSellRaw[0]);

    if (topBuy.price < topSell.price) break; 

    const tradeQty = Math.min(topBuy.quantity, topSell.quantity);
    const tradePrice = topSell.price; 

    await Trade.create({
      buyOrderId: topBuy.orderId,
      sellOrderId: topSell.orderId,
      stockId,
      quantity: tradeQty,
      price: tradePrice,
    });


    topBuy.quantity -= tradeQty;
    topSell.quantity -= tradeQty;

    if (topBuy.quantity <= 0) {
      await redis.zrem(`stock:${stockId}:BUY`, topBuyRaw[0]);
      await Order.findByIdAndUpdate(topBuy.orderId, { status: "COMPLETED" });
    } else {
      await redis.zadd(`stock:${stockId}:BUY`, price * 1e6 - timestamp, JSON.stringify(topBuy));
      await Order.findByIdAndUpdate(topBuy.orderId, { quantity: topBuy.quantity, status: "PARTIAL" });
    }

    if (topSell.quantity <= 0) {
      await redis.zrem(`stock:${stockId}:SELL`, topSellRaw[0]);
      await Order.findByIdAndUpdate(topSell.orderId, { status: "COMPLETED" });
    } else {
      await redis.zadd(`stock:${stockId}:SELL`, price * 1e6 + timestamp, JSON.stringify(topSell));
      await Order.findByIdAndUpdate(topSell.orderId, { quantity: topSell.quantity, status: "PARTIAL" });
    }
  }

  return NextResponse.json({ message: "Order placed and matched if possible", order: newOrder });
}
