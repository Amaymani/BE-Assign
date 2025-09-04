// app/api/stocks/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getStockByIdOrSymbol, searchStocksByNamePrefix } from "@/lib/stockSearch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  // Exact match by ID or symbol
  const exact = await getStockByIdOrSymbol(q);
  if (exact) return NextResponse.json([exact]);

  // Prefix search by name
  const results = await searchStocksByNamePrefix(q);
  return NextResponse.json(results);
}
