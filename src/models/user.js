import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true }, // WhatsApp phone number
    step: { type: String, default: "start" },
    orderData: { type: Object, default: {} },
    customerMap: { type: Object, default: {} },
    selectedCustomer: { type: Object },
    isAuthenticated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserSession = mongoose.model("UserSession", userSessionSchema);
