"use client";

import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import PlaceOrder from "@/components/PlaceOrder";
import TradeFeed from "@/components/TradeFeed";

export default function TradePage() {
  const [selectedStock, setSelectedStock] = useState<any>(null);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stock Trading</h1>
      <StockSearch onSelect={setSelectedStock} />
      {selectedStock && (
        <>
          <PlaceOrder stock={selectedStock} />{" "}
          <TradeFeed stockId={selectedStock._id} />
        </>
      )}

      <div></div>
    </div>
  );
}
