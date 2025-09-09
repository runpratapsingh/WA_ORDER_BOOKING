import { sendMessage, sendLanguageSelection, sendListMessage } from '../services/whatsappService.js';
const userSessions = {};

export async function handleWebhook(req, res) {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) {
    return res.sendStatus(200);
  }

  const from = message.from;
  const profileName = req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || 'User';

  // Case 1: Handle interactive messages (buttons or lists)
  if (message.type === 'interactive') {
    // Language selection buttons
    const buttonReply = message.interactive?.button_reply;
    if (buttonReply) {
      if (buttonReply.id === 'lang_english') {
        await sendMessage(from, "✅ You selected English.\nType 'choose' to see options.");
      } else if (buttonReply.id === 'lang_hindi') {
        await sendMessage(from, "✅ आपने हिंदी चुना।\n'choose' लिखें विकल्प देखने के लिए।");
      }
    }

    // List selection
    const listReply = message.interactive?.list_reply;
    if (listReply) {
      console.log('📌 User selected:', listReply);
      if (listReply.id === 'your_name') {
        await sendMessage(from, `✅ Your name is ${profileName}`);
      } else if (listReply.id === 'order_1') {
        await sendMessage(from, '📦 Order #123 is still pending.');
      } else if (listReply.id === 'order_2') {
        await sendMessage(from, '✅ Order #124 was delivered successfully.');
      }
    }
  }
  // Case 2: Handle text messages
  else if (message.type === 'text') {
    const msg = message.text?.body?.toLowerCase().trim();

    if (msg.includes('hi') || msg.includes('hii')) {
      await sendLanguageSelection(from);
    } else if (msg.includes('choose')) {
      await sendListMessage(from, profileName);
    } else {
      await sendMessage(from, "Sorry, I didn't understand. Type 'hi' to start or 'choose' to see options.");
    }
  } // Inside app.post("/webhook", async (req, res) => { ... })
else {
  const msg = message.text?.body?.toLowerCase();
  console.log("Incoming:", from, msg);

  // Existing logic for hi/choose...

  // New: Handle order creation flow with detailed data collection
  if (msg.includes("create order")) {
    userSessions[from] = { 
      step: 'customer', 
      orderData: { lines: [] } 
    };
    await sendMessage(from, "Great! Let's create a sales order (demo). What's the customer number (e.g., C001)?");
  } else if (userSessions[from]) {
    const session = userSessions[from];

    if (session.step === 'customer') {
      session.orderData.sellToCustomerNo = msg;
      session.step = 'documentDate';
      await sendMessage(from, `Got customer: ${msg}. What's the document date (e.g., 2025-09-09) or press 'enter' for today (${new Date().toISOString().split('T')[0]})?`);
    } else if (session.step === 'documentDate') {
      session.orderData.documentDate = msg || new Date().toISOString().split('T')[0]; // Default to today if empty
      session.step = 'docType';
      await sendMessage(from, `Got date: ${session.orderData.documentDate}. What's the document type? (e.g., invoice, payment, blank - default is blank)`);
    } else if (session.step === 'docType') {
      session.orderData.appliesToDocType = msg || 'blank'; // Default to 'blank' if empty
      session.step = 'item';
      await sendMessage(from, `Got type: ${session.orderData.appliesToDocType}. Now add items. Send item number, quantity (e.g., 'ITEM001 5'). Send 'done' when finished.`);
    } else if (session.step === 'item') {
      if (msg === 'done') {
        // Simulate order creation and store in object
        const orderId = `SO${Date.now()}`; // Dummy order ID
        const demoOrder = {
          orderId,
          sellToCustomerNo: session.orderData.sellToCustomerNo,
          documentDate: session.orderData.documentDate,
          appliesToDocType: session.orderData.appliesToDocType,
          status: 'Open',
          lines: session.orderData.lines,
          createdAt: new Date().toISOString()
        };
        console.log("Demo Sales Order Created:", demoOrder);

        // Store in a demo "database" (in-memory object)
        if (!userSessions.demoOrders) userSessions.demoOrders = {};
        userSessions.demoOrders[orderId] = demoOrder;

        await sendMessage(from, `✅ Demo sales order created! Order ID: ${orderId}. Details: Customer ${demoOrder.sellToCustomerNo}, Date ${demoOrder.documentDate}, Type ${demoOrder.appliesToDocType}. Type 'create order' to start again.`);
        delete userSessions[from];
      } else {
        const [itemNo, quantity] = msg.split(' ');
        if (itemNo && quantity) {
          session.orderData.lines.push({ type: 'Item', no: itemNo, quantity: parseInt(quantity) });
          await sendMessage(from, `Added item ${itemNo} (qty: ${quantity}). Add more or send 'done'.`);
        } else {
          await sendMessage(from, "Invalid format. Use 'ITEM001 5'. Add more or send 'done'.");
        }
      }
    }
  } else {
    // Existing fallback...
    await sendMessage(
      from,
      "Sorry, I didn't understand. Type 'hi' to start, 'choose' to see options, or 'create order' to make a demo order."
    );
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
    res.status(500).json({ error: 'Failed to send message' });
  }
}

export function verifyWebhook(req, res) {
  const { config } = require('../config/config');
  if (req.query['hub.verify_token'] === config.webhookVerifyToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
}