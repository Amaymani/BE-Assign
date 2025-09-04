'use client';

import { useEffect, useState } from "react";

interface Trade {
  _id: string;
  buyOrderId: string;
  sellOrderId: string;
  quantity: number;
  price: number;
  timestamp: string;
}

export default function TradeFeed({ stockId }: { stockId: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);

  const fetchTrades = async () => {
    const res = await fetch(`/api/trades?stockId=${stockId}`);
    const data = await res.json();
    setTrades(data);
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [stockId]);

  return (
    <div className="mt-4 border p-4">
      <h2 className="font-bold mb-2">Live Trades</h2>
      {trades.length === 0 && <p>No trades yet.</p>}
      <ul className="max-h-64 overflow-y-auto">
        {trades.map((t) => (
          <li key={t._id} className="flex justify-between border-b py-1">
            <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
            <span>Qty: {t.quantity}</span>
            <span>Price: ${t.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
