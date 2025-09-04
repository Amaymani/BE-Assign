'use client';

import { useState } from "react";

interface Stock {
  _id: string;
  symbol: string;
  name: string;
  price: number;
}

export default function StockSearch({ onSelect }: { onSelect: (stock: Stock) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Stock[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value) {
      setResults([]);
      return;
    }

    const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(e.target.value)}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search stock by name or symbol"
        className="border p-2 w-full"
      />
      <ul className="border mt-1 max-h-40 overflow-y-auto">
        {results.map((stock) => (
          <li
            key={stock._id}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect(stock)}
          >
            {stock.name} ({stock.symbol}) - ${stock.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
