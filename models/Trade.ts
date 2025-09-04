import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema({
  buyOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  sellOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  quantity: Number,
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
