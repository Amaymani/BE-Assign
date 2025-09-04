import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trade from "@/models/Trade";

export async function GET(req: NextRequest) {
  try {
    const stockId = req.nextUrl.searchParams.get("stockId");
    if (!stockId) return NextResponse.json({ error: "Missing stockId" }, { status: 400 });

    await dbConnect();

    const trades = await Trade.find({ stockId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(trades);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
