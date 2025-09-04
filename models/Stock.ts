// models/Stock.ts
import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  symbol: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export default mongoose.models.Stock || mongoose.model("Stock", StockSchema);
