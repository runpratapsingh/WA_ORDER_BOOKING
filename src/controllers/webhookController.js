import { sendMessage, sendLanguageSelection, sendListMessage } from '../services/whatsappService.js';

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