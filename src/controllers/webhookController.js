// import axios from "axios";
// import {
//   sendMessage,
//   sendLanguageSelection,
//   sendListMessage,
// } from "../services/whatsappService.js";

// const userSessions = {};

// export async function handleWebhook(req, res) {
//   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
//   console.log("Received webhook payload:", req.body); // Log full payload

//   if (!message) {
//     console.log("No message found in webhook payload");
//     return res.sendStatus(200);
//   }

//   const from = message.from;
//   const profileName =
//     req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || "User";
//   console.log("Message from:", from, "Type:", message.type, "Content:", message.text?.body); // Log message details

//   // Case 1: Handle interactive messages (buttons or lists)
//   if (message.type === "interactive") {
//     const buttonReply = message.interactive?.button_reply;
//     const listReply = message.interactive?.list_reply;

//     if (buttonReply) {
//       console.log("Button reply received:", buttonReply.id);
//       if (buttonReply.id === "lang_english") {
//         await sendMessage(
//           from,
//           "✅ You selected English.\nType 'choose' to see options."
//         );
//       } else if (buttonReply.id === "lang_hindi") {
//         await sendMessage(
//           from,
//           "✅ आपने हिंदी चुना।\n'choose' लिखें विकल्प देखने के लिए।"
//         );
//       } 
//     }

//     if (listReply) {
//       console.log("List reply received:", listReply.id);
//       if (listReply.id === "your_name") {
//         await sendMessage(from, `✅ Your name is ${profileName}`);
//       } else if (listReply.id === "order_1") {
//         await sendMessage(from, "📦 Order #123 is still pending.");
//       } else if (listReply.id === "order_2") {
//         await sendMessage(from, "✅ Order #124 was delivered successfully.");
//       } else if (listReply.id === "type_blank" || listReply.id === "type_invoice" || listReply.id === "type_payment") {
//         userSessions[from].orderData.appliesToDocType = listReply.id.replace("type_", "");
//         userSessions[from].step = "item";
//         await sendMessage(
//           from,
//           `Got type: ${userSessions[from].orderData.appliesToDocType}. Now add items. Send item number, quantity (e.g., 'ITEM001 5'). Send 'done' when finished.`
//         );
//       }
//     }
//   }
//   // Case 2: Handle text messages
//   else if (message.type === "text") {
//     const msg = message.text?.body?.toLowerCase().trim();
//     console.log("Text message received:", msg); // Log exact message

//     if (msg.includes("hi") || msg.includes("hii")) {
//       await sendLanguageSelection(from);
//     } else if (msg.includes("choose")) {
//       await sendListMessage(from, profileName);
//     } else {
//       await sendMessage(
//         from,
//         "Sorry, I didn't understand. Type 'hi' to start, 'choose' to see options, or 'create order' to make a demo order."
//       );
//     }
//   }

//   res.sendStatus(200);
// }
import {
  sendMessage,
  sendLanguageSelection,
  sendMainMenu,
  sendCustomerList,
  sendItemList,
  sendApproval,
} from "../services/whatsappService.js";

const userSessions = {};
const processedMessages = new Set();

export async function handleWebhook(req, res) {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from;

  if (!message) return res.sendStatus(200);

  // ✅ Deduplication
  if (processedMessages.has(message.id)) {
    return res.sendStatus(200);
  }
  processedMessages.add(message.id);

  const profileName =
    req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || "User";

  // Ensure session
  if (!userSessions[from]) {
    userSessions[from] = { step: "start", orderData: {} };
  }

  if (message.type === "text") {
    const msg = message.text.body.toLowerCase();

    if (msg.includes("hi")) {
      await sendMainMenu(from);
    } else {
      await sendMessage(from, "Type 'hi' to start again.");
    }
  }

  if (message.type === "interactive") {
    const buttonReply = message.interactive?.button_reply;
    const listReply = message.interactive?.list_reply;

    // ✅ Button replies (approval)
    if (buttonReply) {
      if (buttonReply.id === "approve_yes") {
        await sendMessage(from, "✅ Order approved and saved.");
      } else if (buttonReply.id === "approve_no") {
        await sendMessage(from, "❌ Order cancelled.");
      }
    }

    // ✅ List replies
    if (listReply) {
      // Main menu choice
      if (listReply.id === "sales_order") {
        userSessions[from].step = "customer";
        await sendCustomerList(from);
      } else if (listReply.id === "customer_statement") {
        await sendMessage(from, "📑 Customer Statement feature coming soon.");
      }

      // Customer selection
      else if (listReply.id.startsWith("customer_")) {
        const orderId = `SO/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`;
        userSessions[from].orderData.orderId = orderId;
        userSessions[from].step = "item";
        await sendMessage(from, `✅ Customer updated. Sales Order ID: ${orderId}`);
        await sendItemList(from);
      }

      // Item selection
      else if (listReply.id.startsWith("item_")) {
        userSessions[from].orderData.item = listReply.title;
        userSessions[from].step = "quantity";
        await sendMessage(from, `🛒 You selected ${listReply.title}. Please enter quantity (e.g., 5).`);
      }
    }
  }

  // ✅ Handle quantity input
  if (message.type === "text" && userSessions[from].step === "quantity") {
    const qty = parseInt(message.text.body, 10);
    if (!isNaN(qty)) {
      userSessions[from].orderData.quantity = qty;
      userSessions[from].step = "approval";
      await sendMessage(
        from,
        `📦 Order: ${userSessions[from].orderData.item}, Qty: ${qty}, ID: ${userSessions[from].orderData.orderId}`
      );
      await sendApproval(from);
    } else {
      await sendMessage(from, "❌ Please enter a valid number for quantity.");
    }
  }

  res.sendStatus(200);
}




export async function handleSendMessage(req, res) {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message'" });
  }

  try {
    await sendMessage(to, message);
    res.json({ success: true, to, message });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
}

export function verifyWebhook(req, res) {
  const { config } = require("../config/config");
  if (req.query["hub.verify_token"] === config.webhookVerifyToken) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
}
