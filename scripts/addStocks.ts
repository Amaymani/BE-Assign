import dbConnect from "@/lib/mongodb";
import Stock from "@/models/Stock";
import { addStockToRedis } from "@/lib/stockSearch";

const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 173 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 135 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 299 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 144 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 280 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 330 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 480 },
  { symbol: "NFLX", name: "Netflix Inc.", price: 380 },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", price: 315 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 155 },
  { symbol: "V", name: "Visa Inc.", price: 225 },
  { symbol: "MA", name: "Mastercard Inc.", price: 370 },
  { symbol: "DIS", name: "The Walt Disney Co.", price: 120 },
  { symbol: "KO", name: "Coca-Cola Co.", price: 62 },
  { symbol: "PEP", name: "PepsiCo Inc.", price: 180 },
  { symbol: "BABA", name: "Alibaba Group Holding Ltd.", price: 100 },
  { symbol: "ORCL", name: "Oracle Corp.", price: 105 },
  { symbol: "CSCO", name: "Cisco Systems Inc.", price: 50 },
  { symbol: "INTC", name: "Intel Corp.", price: 32 },
  { symbol: "PFE", name: "Pfizer Inc.", price: 46 },
  { symbol: "MRK", name: "Merck & Co. Inc.", price: 92 },
  { symbol: "XOM", name: "Exxon Mobil Corp.", price: 115 },
  { symbol: "CVX", name: "Chevron Corp.", price: 165 },
  { symbol: "WMT", name: "Walmart Inc.", price: 155 },
  { symbol: "T", name: "AT&T Inc.", price: 19 },
  { symbol: "VZ", name: "Verizon Communications Inc.", price: 37 },
  { symbol: "NKE", name: "Nike Inc.", price: 125 },
  { symbol: "SBUX", name: "Starbucks Corp.", price: 110 },
  { symbol: "ADBE", name: "Adobe Inc.", price: 470 },
  { symbol: "CRM", name: "Salesforce Inc.", price: 210 }
];


async function main() {
  await dbConnect();

  for (const stock of stocks) {
    const existing = await Stock.findOne({ symbol: stock.symbol });
    if (existing) continue;

    const newStock = await Stock.create(stock);


    await addStockToRedis(newStock);

    console.log(`Added stock: ${stock.symbol} - ${stock.name}`);
  }

  console.log("All stocks added!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
