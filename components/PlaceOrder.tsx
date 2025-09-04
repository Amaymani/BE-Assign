"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Stock {
  _id: string;
  symbol: string;
  name: string;
  price: number;
}

export default function PlaceOrder({ stock }: { stock: Stock }) {
  const { data: session } = useSession();
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(0);
const [price, setPrice] = useState(stock.price);

  const [message, setMessage] = useState("");

  if (!session) return <p>Please log in to place an order.</p>;

  const handleSubmit = async () => {
    if (quantity <= 0) return setMessage("Quantity must be greater than 0");
    if (price <= 0) return setMessage("Price must be greater than 0");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockId: stock._id,
        type,
        quantity,
        price,
      }),
    });

    const data = await res.json();
    if (res.ok) setMessage("Order placed successfully!");
    else setMessage(data.error || "Error placing order");
  };

  return (
    <div className="border p-4 mt-4">
      <h2>
        Place Order for {stock.name} ({stock.symbol})
      </h2>
      <div className="mt-2">
        <label>
          Type:{" "}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "BUY" | "SELL")}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </label>
      </div>
      <div className="mt-2">
        <label>
          Quantity:{" "}
          <input
            type="number"
            value={quantity || ""}
            onChange={(e) =>{
              setQuantity(e.target.value ? parseInt(e.target.value) : 0);
              setMessage("");}
            }
            className="border p-1"
          />
        </label>
      </div>
      <div className="mt-2">
        <label>
          Price:{" "}
          <input
            type="number"
            value={price || ""}
            onChange={(e) =>
              setPrice(e.target.value ? parseFloat(e.target.value) : 0)
            }
            className="border p-1"
          />
        </label>
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 mt-2"
      >
        Place Order
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
