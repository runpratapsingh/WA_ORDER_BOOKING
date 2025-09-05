// // index.js
// const express = require("express");
// const bodyParser = require("body-parser");
// const soap = require("soap");
// const axios = require("axios");

// const app = express();
// app.use(bodyParser.json());

// // ===== Replace with your details =====
// const WHATSAPP_TOKEN = "YOUR_META_WHATSAPP_TOKEN";
// const PHONE_NUMBER_ID = "YOUR_PHONE_NUMBER_ID";
// const BC_SOAP_URL =
//   "http://20.198.227.247:7047/BC240/WS/CRONUS%20India%20Ltd./Page/SalesOrder?wsdl";
// const BC_AUTH = { user: "BC_USERNAME", pass: "BC_PASSWORD" }; // if Basic Auth
// // ====================================

// // ✅ Webhook verification (Meta requires this once)
// app.get("/webhook", (req, res) => {
//   const VERIFY_TOKEN = "my_verify_token"; // set in Meta Dashboard

//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode && token === VERIFY_TOKEN) {
//     console.log("Webhook verified ✅");
//     res.status(200).send(challenge);
//   } else {
//     res.sendStatus(403);
//   }
// });

// // ✅ Webhook to receive WhatsApp messages
// app.post("/webhook", async (req, res) => {
//   try {
//     const entry = req.body.entry?.[0];
//     const changes = entry?.changes?.[0];
//     const messages = changes?.value?.messages;

//     if (messages) {
//       const msg = messages[0];
//       const from = msg.from; // customer number
//       const text = msg.text?.body;

//       console.log("📩 Incoming WhatsApp:", text);

//       let reply;

//       if (text.toLowerCase().includes("order")) {
//         reply = await getSalesOrdersFromBC();
//       } else {
//         reply =
//           "Hi 👋, send 'orders' to get Sales Orders from Business Central.";
//       }

//       await sendWhatsAppMessage(from, reply);
//     }
//     res.sendStatus(200);
//   } catch (err) {
//     console.error("Webhook error:", err);
//     res.sendStatus(500);
//   }
// });

// // ✅ Function: Call BC SOAP API
// async function getSalesOrdersFromBC() {
//   return new Promise((resolve, reject) => {
//     soap.createClient(
//       BC_SOAP_URL,
//       { wsdl_options: { auth: BC_AUTH } },
//       (err, client) => {
//         if (err) return reject("SOAP Client error: " + err);

//         // Example: Call ReadMultiple to get list of sales orders
//         client.ReadMultiple({ filter: [], setSize: 3 }, (err, result) => {
//           if (err) return reject("SOAP API error: " + err);

//           const orders = result?.ReadMultiple_Result?.SalesOrder;
//           if (!orders || orders.length === 0) {
//             resolve("No Sales Orders found.");
//           } else {
//             const replyText = orders
//               .map((o) => `${o.No} - ${o.Sell_to_Customer_Name}`)
//               .join("\n");
//             resolve("Here are some Sales Orders:\n" + replyText);
//           }
//         });
//       }
//     );
//   });
// }

// // ✅ Function: Send WhatsApp message via Cloud API
// async function sendWhatsAppMessage(to, message) {
//   try {
//     await axios.post(
//       `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to,
//         type: "text",
//         text: { body: message },
//       },
//       { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
//     );
//     console.log("✅ Sent reply to WhatsApp");
//   } catch (err) {
//     console.error(
//       "Error sending WhatsApp message:",
//       err.response?.data || err.message
//     );
//   }
// }

// app.listen(3000, () => console.log("🚀 Server running on port 3000"));

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

const META_TOKEN =
  "EAAJkBk85o2gBPTMqnfOGtSVpvLOYJkXSsCgveRpbLU0DbcTAsSqkhXQQZCYdKdQ08prxZA2ZB79YDDPu77ou4rZAzbZBDHhXYYPaiRJnZBnCdHr7pabJgpevasvIligtGyoMNpeZBmNf72LxswJr9gFKwZAPEH5otfjOutWKZCGtIwIqYcbMwUloiqkRLyngODfggKYDbU9H4yTe62TaZCIe28QKQeQkF4HWQkZCrcWsEyvLkZALZCAZDZD"; // Your token
const PHONE_NUMBER_ID = "754571211077181"; // From your dashboard

// ✅ Send WhatsApp Message
async function sendMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    },
    { headers: { Authorization: `Bearer ${META_TOKEN}` } }
  );
}

// ✅ Webhook for incoming messages
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message) {
    const from = message.from; // Customer number
    const msg = message.text?.body; // Message body
    console.log("Incoming:", from, msg);

    // Example: reply back
    await sendMessage(from, `You said: ${msg}`);
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

app.listen(3000, () => console.log("Server running on 3000"));
