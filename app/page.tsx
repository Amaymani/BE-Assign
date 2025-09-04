"use client";

import { useState, useEffect } from "react";
import StockSearch from "@/components/StockSearch";
import PlaceOrder from "@/components/PlaceOrder";
import TradeFeed from "@/components/TradeFeed";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TradePage() {
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session) {
    // Render nothing while redirecting
    return null;
  }


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
