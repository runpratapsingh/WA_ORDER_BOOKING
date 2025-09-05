// import express from "express";
// import bodyParser from "body-parser";
// import axios from "axios";

// const app = express();
// app.use(bodyParser.json());

// const META_TOKEN =
//   "EAAJkBk85o2gBPdMpNPRbGdSvXYxBwa2GCrgz6OEgaXg1qhJEYC0NfyySnZBLbo8HjFSEoVoQZAxbA9StBwo2jfbdEwBrQ5iIbytlQKGEZADlvUfBlq5iuPx66knO0JUuwxh9i99u6d0NBPdsxc3NujZCvZAYLGZCivzfYDp6bxfwAAqvYzvQd7DwNpWvGxMFGset45plZBdyJCOHm9IPYOflvXqK495Xdsb3iGhj9In8ShpX1sZD"; // your token
// const PHONE_NUMBER_ID = "754571211077181"; // from your dashboard

// // ✅ Function to send WhatsApp message
// async function sendMessage(to, text) {
//   try {
//     await axios.post(
//       `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to,
//         text: { body: text },
//       },
//       { headers: { Authorization: `Bearer ${META_TOKEN}` } }
//     );
//     console.log("✅ Message sent to:", to);
//   } catch (err) {
//     console.error(
//       "❌ Error sending message:",
//       err.response?.data || err.message
//     );
//   }
// }

// // ✅ New API: Send message manually (use Postman)
// app.post("/send", async (req, res) => {
//   const { to, message } = req.body;

//   if (!to || !message) {
//     return res.status(400).json({ error: "Missing 'to' or 'message'" });
//   }

//   await sendMessage(to, message);
//   res.json({ success: true, to, message });
// });

// // ✅ Webhook for incoming messages
// app.post("/webhook", async (req, res) => {
//   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

//   if (message) {
//     const from = message.from;
//     const msg = message.text?.body?.toLowerCase();
//     console.log("Incoming:", from, msg);

//     let reply;

//     if (msg.includes("hii") || msg.includes("hi")) {
//       reply = "Hello 👋, how are you? How can I help you?";
//     } else if (msg.includes("order")) {
//       reply = "Sure ✅, please provide your order ID or details.";
//     } else {
//       reply = "Sorry, I didn't understand. Type 'hii' or 'order' to start.";
//     }

//     await sendMessage(from, reply);
//   }

//   res.sendStatus(200);
// });

// // ✅ Verify Webhook
// app.get("/webhook", (req, res) => {
//   if (req.query["hub.verify_token"] === "myVerify123") {
//     res.send(req.query["hub.challenge"]);
//   } else {
//     res.sendStatus(403);
//   }
// });

// app.listen(3000, () => console.log("🚀 Server running on port 3000"));

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

const META_TOKEN =
  "EAAJkBk85o2gBPdMpNPRbGdSvXYxBwa2GCrgz6OEgaXg1qhJEYC0NfyySnZBLbo8HjFSEoVoQZAxbA9StBwo2jfbdEwBrQ5iIbytlQKGEZADlvUfBlq5iuPx66knO0JUuwxh9i99u6d0NBPdsxc3NujZCvZAYLGZCivzfYDp6bxfwAAqvYzvQd7DwNpWvGxMFGset45plZBdyJCOHm9IPYOflvXqK495Xdsb3iGhj9In8ShpX1sZD"; // your token
const PHONE_NUMBER_ID = "754571211077181"; // from your Meta dashboard

// ✅ Send normal text message
async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );
    console.log("✅ Message sent to:", to);
  } catch (err) {
    console.error(
      "❌ Error sending message:",
      err.response?.data || err.message
    );
  }
}

// ✅ Send interactive buttons for Language selection
async function sendLanguageSelection(to) {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "🌐 Please select your preferred language:",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "lang_english",
                  title: "English",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "lang_hindi",
                  title: "हिंदी",
                },
              },
            ],
          },
        },
      },
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );
    console.log("✅ Language selection sent!");
  } catch (err) {
    console.error(
      "❌ Error sending interactive message:",
      err.response?.data || err.message
    );
  }
}

// ✅ API to send manual message via Postman
app.post("/send", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message'" });
  }

  await sendMessage(to, message);
  res.json({ success: true, to, message });
});

// ✅ Webhook for incoming messages
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from;

    // Case 1: User clicked a button
    if (message.type === "interactive") {
      const buttonReply = message.interactive?.button_reply;
      if (buttonReply) {
        if (buttonReply.id === "lang_english") {
          await sendMessage(
            from,
            "✅ You selected English. How can I help you?"
          );
        } else if (buttonReply.id === "lang_hindi") {
          await sendMessage(
            from,
            "✅ आपने हिंदी चुना। मैं आपकी कैसे मदद कर सकता हूँ?"
          );
        }
      }
    }
    // Case 2: User sent a text message
    else {
      const msg = message.text?.body?.toLowerCase();
      console.log("Incoming:", from, msg);

      if (msg.includes("language")) {
        await sendLanguageSelection(from); // send interactive buttons
      } else if (msg.includes("hii") || msg.includes("hi")) {
        await sendMessage(
          from,
          "Hello 👋, type 'language' to choose Hindi/English."
        );
      } else if (msg.includes("order")) {
        await sendMessage(
          from,
          "Sure ✅, please provide your order ID or details."
        );
      } else {
        await sendMessage(
          from,
          "Sorry, I didn't understand. Type 'language', 'hii', or 'order' to start."
        );
      }
    }
  }

  res.sendStatus(200);
});

// ✅ Verify Webhook
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === "myVerify123") {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
