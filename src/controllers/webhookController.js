// import axios from "axios";
// import {
//   sendMessage,
//   sendLanguageSelection,
//   sendListMessage,
// } from "../services/whatsappService.js";
// const userSessions = {};

// // New functions for interactive selections
// async function sendCustomerSelection(to) {
//   try {
//     const payload = {
//       messaging_product: "whatsapp",
//       to,
//       type: "interactive",
//       interactive: {
//         type: "button",
//         body: { text: "Select a customer:" },
//         action: {
//           buttons: [
//             {
//               type: "reply",
//               reply: { id: "cust_c001", title: "C001 - Customer 1" },
//             },
//             {
//               type: "reply",
//               reply: { id: "cust_c002", title: "C002 - Customer 2" },
//             },
//           ],
//         },
//       },
//     };
//     await axios.post(
//       `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
//       payload,
//       { headers: { Authorization: `Bearer ${META_TOKEN}` } }
//     );
//     console.log("✅ Customer selection sent to:", to);
//   } catch (err) {
//     console.error(
//       "❌ Error sending customer selection:",
//       err.response?.data || err.message
//     );
//   }
// }

// async function sendDateSelection(to) {
//   try {
//     const payload = {
//       messaging_product: "whatsapp",
//       to,
//       type: "interactive",
//       interactive: {
//         type: "button",
//         body: { text: "Select a document date:" },
//         action: {
//           buttons: [
//             {
//               type: "reply",
//               reply: {
//                 id: "date_today",
//                 title: `Today (${new Date().toISOString().split("T")[0]})`,
//               },
//             },
//             {
//               type: "reply",
//               reply: { id: "date_custom", title: "Tomorrow (2025-09-10)" },
//             },
//           ],
//         },
//       },
//     };
//     await axios.post(
//       `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
//       payload,
//       { headers: { Authorization: `Bearer ${META_TOKEN}` } }
//     );
//     console.log("✅ Date selection sent to:", to);
//   } catch (err) {
//     console.error(
//       "❌ Error sending date selection:",
//       err.response?.data || err.message
//     );
//   }
// }

// async function sendDocTypeSelection(to) {
//   try {
//     const payload = {
//       messaging_product: "whatsapp",
//       to,
//       type: "interactive",
//       interactive: {
//         type: "list",
//         body: { text: "Select a document type:" },
//         action: {
//           button: "Choose Type",
//           sections: [
//             {
//               title: "Options",
//               rows: [
//                 { id: "type_blank", title: "Blank" },
//                 { id: "type_invoice", title: "Invoice" },
//                 { id: "type_payment", title: "Payment" },
//               ],
//             },
//           ],
//         },
//       },
//     };
//     await axios.post(
//       `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
//       payload,
//       { headers: { Authorization: `Bearer ${META_TOKEN}` } }
//     );
//     console.log("✅ DocType selection sent to:", to);
//   } catch (err) {
//     console.error(
//       "❌ Error sending docType selection:",
//       err.response?.data || err.message
//     );
//   }
// }

// export async function handleWebhook(req, res) {
//   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

//   if (!message) {
//     return res.sendStatus(200);
//   }

//   const from = message.from;
//   const profileName =
//     req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
//     "User";

//   // Case 1: Handle interactive messages (buttons or lists)
//   if (message.type === "interactive") {
//     // Language selection buttons
//     const buttonReply = message.interactive?.button_reply;
//     if (buttonReply) {
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

//     // List selection
//     const listReply = message.interactive?.list_reply;
//     if (listReply) {
//       console.log("📌 User selected:", listReply);
//       if (listReply.id === "your_name") {
//         await sendMessage(from, `✅ Your name is ${profileName}`);
//       } else if (listReply.id === "order_1") {
//         await sendMessage(from, "📦 Order #123 is still pending.");
//       } else if (listReply.id === "order_2") {
//         await sendMessage(from, "✅ Order #124 was delivered successfully.");
//       }
//     }
//   }
//   // Case 2: Handle text messages
//   else if (message.type === "text") {
//     const msg = message.text?.body?.toLowerCase().trim();

//     if (msg.includes("hi") || msg.includes("hii")) {
//       await sendLanguageSelection(from);
//     } else if (msg.includes("choose")) {
//       await sendListMessage(from, profileName);
//     } else {
//       const msg = message.text?.body?.toLowerCase();
//       console.log("Incoming:", from, msg);

//       // Existing logic for hi/choose...

//       // New: Handle order creation flow with interactive selections
//       if (msg.includes("create order")) {
//         userSessions[from] = { step: "customer", orderData: { lines: [] } };
//         // Send interactive buttons for customer selection
//         await sendCustomerSelection(from);
//       } else if (userSessions[from]) {
//         const session = userSessions[from];

//         if (session.step === "customer") {
//           if (msg === "cust_c001" || msg === "cust_c002") {
//             session.orderData.sellToCustomerNo =
//               msg === "cust_c001" ? "C001" : "C002";
//             session.step = "documentDate";
//             await sendDateSelection(from);
//           }
//         } else if (session.step === "documentDate") {
//           if (msg === "date_today" || msg === "date_custom") {
//             session.orderData.documentDate =
//               msg === "date_today"
//                 ? new Date().toISOString().split("T")[0]
//                 : "2025-09-10"; // Default custom date
//             session.step = "docType";
//             await sendDocTypeSelection(from);
//           }
//         } else if (session.step === "docType") {
//           if (
//             msg === "type_blank" ||
//             msg === "type_invoice" ||
//             msg === "type_payment"
//           ) {
//             session.orderData.appliesToDocType = msg.replace("type_", "");
//             session.step = "item";
//             await sendMessage(
//               from,
//               `Got type: ${session.orderData.appliesToDocType}. Now add items. Send item number, quantity (e.g., 'ITEM001 5'). Send 'done' when finished.`
//             );
//           }
//         } else if (session.step === "item") {
//           if (msg === "done") {
//             const orderId = `SO${Date.now()}`;
//             const demoOrder = {
//               orderId,
//               sellToCustomerNo: session.orderData.sellToCustomerNo,
//               documentDate: session.orderData.documentDate,
//               appliesToDocType: session.orderData.appliesToDocType,
//               status: "Open",
//               lines: session.orderData.lines,
//               createdAt: new Date().toISOString(),
//             };
//             console.log("Demo Sales Order Created:", demoOrder);

//             if (!userSessions.demoOrders) userSessions.demoOrders = {};
//             userSessions.demoOrders[orderId] = demoOrder;

//             await sendMessage(
//               from,
//               `✅ Demo sales order created! Order ID: ${orderId}. Details: Customer ${demoOrder.sellToCustomerNo}, Date ${demoOrder.documentDate}, Type ${demoOrder.appliesToDocType}. Type 'create order' to start again.`
//             );
//             delete userSessions[from];
//           } else {
//             const [itemNo, quantity] = msg.split(" ");
//             if (itemNo && quantity) {
//               session.orderData.lines.push({
//                 type: "Item",
//                 no: itemNo,
//                 quantity: parseInt(quantity),
//               });
//               await sendMessage(
//                 from,
//                 `Added item ${itemNo} (qty: ${quantity}). Add more or send 'done'.`
//               );
//             } else {
//               await sendMessage(
//                 from,
//                 "Invalid format. Use 'ITEM001 5'. Add more or send 'done'."
//               );
//             }
//           }
//         }
//       } else {
//         await sendMessage(
//           from,
//           "Sorry, I didn't understand. Type 'hi' to start, 'choose' to see options, or 'create order' to make a demo order."
//         );
//       }
//     }
//   } // Inside app.post("/webhook", async (req, res) => { ... })

//   res.sendStatus(200);
// }

// export async function handleSendMessage(req, res) {
//   const { to, message } = req.body;

//   if (!to || !message) {
//     return res.status(400).json({ error: "Missing 'to' or 'message'" });
//   }

//   try {
//     await sendMessage(to, message);
//     res.json({ success: true, to, message });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to send message" });
//   }
// }

// export function verifyWebhook(req, res) {
//   const { config } = require("../config/config");
//   if (req.query["hub.verify_token"] === config.webhookVerifyToken) {
//     res.send(req.query["hub.challenge"]);
//   } else {
//     res.sendStatus(403);
//   }
// }



import axios from "axios";
import {
  sendMessage,
  sendLanguageSelection,
  sendListMessage,
} from "../services/whatsappService.js";

const userSessions = {};

// New functions for interactive selections
async function sendCustomerSelection(to) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Select a customer:" },
        action: {
          buttons: [
            {
              type: "reply",
              reply: { id: "cust_c001", title: "C001 - Customer 1" },
            },
            {
              type: "reply",
              reply: { id: "cust_c002", title: "C002 - Customer 2" },
            },
          ],
        },
      },
    };
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );
    console.log("✅ Customer selection sent, Response:", response.data);
  } catch (err) {
    console.error(
      "❌ Error sending customer selection:",
      err.response?.data || err.message
    );
  }
}

async function sendDateSelection(to) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Select a document date:" },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "date_today",
                title: `Today (${new Date().toISOString().split("T")[0]})`,
              },
            },
            {
              type: "reply",
              reply: { id: "date_custom", title: "Tomorrow (2025-09-10)" },
            },
          ],
        },
      },
    };
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );
    console.log("✅ Date selection sent, Response:", response.data);
  } catch (err) {
    console.error(
      "❌ Error sending date selection:",
      err.response?.data || err.message
    );
  }
}

async function sendDocTypeSelection(to) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: "Select a document type:" },
        action: {
          button: "Choose Type",
          sections: [
            {
              title: "Options",
              rows: [
                { id: "type_blank", title: "Blank" },
                { id: "type_invoice", title: "Invoice" },
                { id: "type_payment", title: "Payment" },
              ],
            },
          ],
        },
      },
    };
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );
    console.log("✅ DocType selection sent, Response:", response.data);
  } catch (err) {
    console.error(
      "❌ Error sending docType selection:",
      err.response?.data || err.message
    );
  }
}

// export async function handleWebhook(req, res) {
//   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
//   console.log("Received webhook payload:", req.body); // Debug log

//   if (!message) {
//     console.log("No message found in webhook payload");
//     return res.sendStatus(200);
//   }

//   const from = message.from;
//   const profileName =
//     req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
//     "User";
//   console.log("Message from:", from, "Type:", message.type, "Content:", message.text?.body); // Debug log

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
//       } else if (buttonReply.id === "cust_c001" || buttonReply.id === "cust_c002") {
//         userSessions[from] = userSessions[from] || { step: "customer", orderData: { lines: [] } };
//         userSessions[from].orderData.sellToCustomerNo = buttonReply.id === "cust_c001" ? "C001" : "C002";
//         userSessions[from].step = "documentDate";
//         await sendDateSelection(from);
//       } else if (buttonReply.id === "date_today" || buttonReply.id === "date_custom") {
//         userSessions[from].orderData.documentDate = buttonReply.id === "date_today" ? new Date().toISOString().split("T")[0] : "2025-09-10";
//         userSessions[from].step = "docType";
//         await sendDocTypeSelection(from);
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
//     console.log("Text message received:", msg);

//     if (msg.includes("hi") || msg.includes("hii")) {
//       await sendLanguageSelection(from);
//     } else if (msg.includes("choose")) {
//       await sendListMessage(from, profileName);
//     } else if (msg.includes("create order")) {
//       console.log("Creating order for:", from);
//       userSessions[from] = { step: "customer", orderData: { lines: [] } };
//       await sendCustomerSelection(from);
//     } else if (userSessions[from]) {
//       const session = userSessions[from];

//       if (session.step === "item") {
//         if (msg === "done") {
//           const orderId = `SO${Date.now()}`;
//           const demoOrder = {
//             orderId,
//             sellToCustomerNo: session.orderData.sellToCustomerNo,
//             documentDate: session.orderData.documentDate,
//             appliesToDocType: session.orderData.appliesToDocType,
//             status: "Open",
//             lines: session.orderData.lines,
//             createdAt: new Date().toISOString(),
//           };
//           console.log("Demo Sales Order Created:", demoOrder);

//           if (!userSessions.demoOrders) userSessions.demoOrders = {};
//           userSessions.demoOrders[orderId] = demoOrder;

//           await sendMessage(
//             from,
//             `✅ Demo sales order created! Order ID: ${orderId}. Details: Customer ${demoOrder.sellToCustomerNo}, Date ${demoOrder.documentDate}, Type ${demoOrder.appliesToDocType}. Type 'create order' to start again.`
//           );
//           delete userSessions[from];
//         } else {
//           const [itemNo, quantity] = msg.split(" ");
//           if (itemNo && quantity) {
//             session.orderData.lines.push({
//               type: "Item",
//               no: itemNo,
//               quantity: parseInt(quantity),
//             });
//             await sendMessage(
//               from,
//               `Added item ${itemNo} (qty: ${quantity}). Add more or send 'done'.`
//             );
//           } else {
//             await sendMessage(
//               from,
//               "Invalid format. Use 'ITEM001 5'. Add more or send 'done'."
//             );
//           }
//         }
//       }
//     } else {
//       await sendMessage(
//         from,
//         "Sorry, I didn't understand. Type 'hi' to start, 'choose' to see options, or 'create order' to make a demo order."
//       );
//     }
//   }

//   res.sendStatus(200);
// }

export async function handleWebhook(req, res) {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  console.log("Received webhook payload:", req.body); // Log full payload

  if (!message) {
    console.log("No message found in webhook payload");
    return res.sendStatus(200);
  }

  const from = message.from;
  const profileName =
    req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || "User";
  console.log("Message from:", from, "Type:", message.type, "Content:", message.text?.body); // Log message details

  // Case 1: Handle interactive messages (buttons or lists)
  if (message.type === "interactive") {
    const buttonReply = message.interactive?.button_reply;
    const listReply = message.interactive?.list_reply;

    if (buttonReply) {
      console.log("Button reply received:", buttonReply.id);
      if (buttonReply.id === "lang_english") {
        await sendMessage(
          from,
          "✅ You selected English.\nType 'choose' to see options."
        );
      } else if (buttonReply.id === "lang_hindi") {
        await sendMessage(
          from,
          "✅ आपने हिंदी चुना।\n'choose' लिखें विकल्प देखने के लिए।"
        );
      } else if (buttonReply.id === "cust_c001" || buttonReply.id === "cust_c002") {
        userSessions[from] = userSessions[from] || { step: "customer", orderData: { lines: [] } };
        userSessions[from].orderData.sellToCustomerNo = buttonReply.id === "cust_c001" ? "C001" : "C002";
        userSessions[from].step = "documentDate";
        await sendDateSelection(from);
      } else if (buttonReply.id === "date_today" || buttonReply.id === "date_custom") {
        userSessions[from].orderData.documentDate = buttonReply.id === "date_today" ? new Date().toISOString().split("T")[0] : "2025-09-10";
        userSessions[from].step = "docType";
        await sendDocTypeSelection(from);
      }
    }

    if (listReply) {
      console.log("List reply received:", listReply.id);
      if (listReply.id === "your_name") {
        await sendMessage(from, `✅ Your name is ${profileName}`);
      } else if (listReply.id === "order_1") {
        await sendMessage(from, "📦 Order #123 is still pending.");
      } else if (listReply.id === "order_2") {
        await sendMessage(from, "✅ Order #124 was delivered successfully.");
      } else if (listReply.id === "type_blank" || listReply.id === "type_invoice" || listReply.id === "type_payment") {
        userSessions[from].orderData.appliesToDocType = listReply.id.replace("type_", "");
        userSessions[from].step = "item";
        await sendMessage(
          from,
          `Got type: ${userSessions[from].orderData.appliesToDocType}. Now add items. Send item number, quantity (e.g., 'ITEM001 5'). Send 'done' when finished.`
        );
      }
    }
  }
  // Case 2: Handle text messages
  else if (message.type === "text") {
    const msg = message.text?.body?.toLowerCase().trim();
    console.log("Text message received:", msg); // Log exact message

    if (msg.includes("hi") || msg.includes("hii")) {
      await sendLanguageSelection(from);
    } else if (msg.includes("choose")) {
      await sendListMessage(from, profileName);
    } else if (msg.includes("create order")) {
      console.log("Creating order for:", from); // Confirm entry
      try {
        userSessions[from] = { step: "customer", orderData: { lines: [] } };
        console.log("Session initialized:", userSessions[from]);
        await sendCustomerSelection(from);
        console.log("Customer selection sent");
      } catch (error) {
        console.error("Error in create order flow:", error); // Catch errors
        await sendMessage(from, "❌ An error occurred while starting your order. Please try again.", error);
      }
    } else if (userSessions[from]) {
      const session = userSessions[from];

      if (session.step === "item") {
        if (msg === "done") {
          const orderId = `SO${Date.now()}`;
          const demoOrder = {
            orderId,
            sellToCustomerNo: session.orderData.sellToCustomerNo,
            documentDate: session.orderData.documentDate,
            appliesToDocType: session.orderData.appliesToDocType,
            status: "Open",
            lines: session.orderData.lines,
            createdAt: new Date().toISOString(),
          };
          console.log("Demo Sales Order Created:", demoOrder);

          if (!userSessions.demoOrders) userSessions.demoOrders = {};
          userSessions.demoOrders[orderId] = demoOrder;

          await sendMessage(
            from,
            `✅ Demo sales order created! Order ID: ${orderId}. Details: Customer ${demoOrder.sellToCustomerNo}, Date ${demoOrder.documentDate}, Type ${demoOrder.appliesToDocType}. Type 'create order' to start again.`
          );
          delete userSessions[from];
        } else {
          const [itemNo, quantity] = msg.split(" ");
          if (itemNo && quantity) {
            session.orderData.lines.push({
              type: "Item",
              no: itemNo,
              quantity: parseInt(quantity),
            });
            await sendMessage(
              from,
              `Added item ${itemNo} (qty: ${quantity}). Add more or send 'done'.`
            );
          } else {
            await sendMessage(
              from,
              "Invalid format. Use 'ITEM001 5'. Add more or send 'done'."
            );
          }
        }
      }
    } else {
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
