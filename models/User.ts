import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },  // 👈 store hashed password
  createdAt: { type: Date, default: Date.now },
});

// Avoid recompiling the model
export default mongoose.models.User || mongoose.model("User", UserSchema);
