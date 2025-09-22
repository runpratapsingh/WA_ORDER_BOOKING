import { UserSession } from "../models/user.js";

export async function getSession(phone) {
  let session = await UserSession.findOne({ phone });
  if (!session) {
    session = new UserSession({ phone });
    await session.save();
  }
  return session;
}

export async function updateSession(phone, updates) {
  return await UserSession.findOneAndUpdate(
    { phone },
    { $set: updates },
    { new: true, upsert: true }
  );
}

export async function resetSession(phone) {
  return await UserSession.findOneAndUpdate(
    { phone },
    { step: "start", orderData: {}, customerMap: {}, selectedCustomer: null },
    { new: true }
  );
}
