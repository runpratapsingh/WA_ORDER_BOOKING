import { fetchSalesPersons } from "../api/apiconfig.js";
import { config } from "../config/config.js";
import {
  sendMessage,
  sendMainMenu,
  sendCustomerList,
  sendItemList,
  sendApproval,
  sendPDF,
} from "../services/whatsappService.js";

export const userSessions = {};
const processedMessages = new Set();

// Main Webhook handler
export async function handleWebhook(req, res) {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from;

  if (!message) return res.sendStatus(200);

  // Deduplicate messages
  if (processedMessages.has(message.id)) return res.sendStatus(200);
  processedMessages.add(message.id);

  const profileName =
    req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
    "User";

  // Ensure user session
  if (!userSessions[from])
    userSessions[from] = { step: "start", orderData: {} };

  // ------------------- INTERACTIVE MESSAGE -------------------
  if (message.type === "interactive") {
    const buttonReply = message.interactive?.button_reply;
    const listReply = message.interactive?.list_reply;

    // Handle button replies (approval)
    if (buttonReply) {
      if (buttonReply.id === "approve_yes") {
        console.log("Order approved:", userSessions[from].orderData);
        await sendMessage(from, "✅ Order approved and saved.");
      } else if (buttonReply.id === "approve_no") {
        await sendMessage(from, "❌ Order cancelled.");
        userSessions[from].step = "start"; // reset session
      }
    }

    // Handle list replies
    if (listReply) {
      // Main menu choice
      if (listReply.id === "sales_order") {
        userSessions[from].step = "search_customer";
        await sendMessage(from, "🔍 Please type the customer name to search:");
      } else if (listReply.id === "customer_statement") {
        // await sendMessage(from, "📑 Customer Statement feature coming soon.");
        const pdfUrl = "https://morth.nic.in/sites/default/files/dd12-13_0.pdf"; // must be publicly accessible
        await sendPDF(from, pdfUrl, "Customer_Statement.pdf");
      }

      // Customer selection
      else if (listReply.id.startsWith("customer_")) {
        const orderId = `SO/${new Date().getFullYear()}/${Math.floor(
          Math.random() * 1000
        )}`;
        userSessions[from].orderData.orderId = orderId;
        userSessions[from].selectedCustomer =
          userSessions[from].customerMap[listReply.id];
        userSessions[from].step = "search_item"; // 🔹 now we expect user to type item name

        await sendMessage(
          from,
          `✅ Customer selected: ${userSessions[from].selectedCustomer.Name}\nSales Order ID: ${orderId}`
        );
        await sendMessage(from, "🔍 Please type the item name to search:");
      }

      // Item selection
      else if (listReply.id.startsWith("item_")) {
        userSessions[from].orderData.item = listReply.title;
        userSessions[from].step = "quantity";
        await sendMessage(
          from,
          `🛒 You selected ${listReply.title}. Please enter quantity (e.g., 5).`
        );
      }
    }
  }

  // ------------------- TEXT MESSAGE -------------------
  if (message.type === "text") {
    const msg = message.text.body.toLowerCase().trim();

    // Start conversation
    if (msg.includes("hi")) {
      console.log(`New session started for ${from}`);
      userSessions[from].step = "start";
      await sendMainMenu(from);
    }

    // Step: Search Customer
    else if (userSessions[from].step === "search_customer") {
      const keyword = msg;
      console.log(`Searching customers for: ${keyword}`);
      await sendCustomerList(from, keyword); // send filtered customer list
      userSessions[from].step = "customer"; // next: select customer
    }

    // 🔹 Step: Search Item
    else if (userSessions[from].step === "search_item") {
      const keyword = msg;
      console.log(`Searching items for: ${keyword}`);
      await sendItemList(from, keyword); // send filtered item list
      userSessions[from].step = "item"; // next: select item
    }

    // Step: Quantity input
    else if (userSessions[from].step === "quantity") {
      const qty = parseInt(message.text.body, 10);
      if (!isNaN(qty)) {
        userSessions[from].orderData.quantity = qty;
        userSessions[from].step = "approval";
        console.log("Order Data:", userSessions[from].orderData);

        await sendMessage(
          from,
          `📦 Order: ${userSessions[from].orderData.item}, Qty: ${qty}, Customer: ${userSessions[from].selectedCustomer.Name}, Order ID: ${userSessions[from].orderData.orderId}`
        );

        await sendApproval(from);
      } else {
        await sendMessage(from, "❌ Please enter a valid number for quantity.");
      }
    } else {
      await sendMessage(from, "Type 'hi' to start again.");
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

export async function checkController(req, res) {
  const items = await fetchSalesPersons();
  res.json({ status: "Controller is working", items });
}

export function verifyWebhook(req, res) {
  console.log(
    "Webhook verification request:",
    config.webhookVerifyToken,
    req.query
  ); // Log query params
  if (req.query["hub.verify_token"] === config.webhookVerifyToken) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
}
