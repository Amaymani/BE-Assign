import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  type: { type: String, enum: ["BUY", "SELL"] },
  quantity: Number,
  price: Number,
  status: { type: String, enum: ["PENDING", "PARTIAL", "COMPLETED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
