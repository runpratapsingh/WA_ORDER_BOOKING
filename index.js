import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

const META_TOKEN =
  "EAAJkBk85o2gBPcrf7ZCSRnzm23voUybWgSZCvthXZCyJsnhi6yBAmICTAZAVWNyMgVH8aL4PqlYf3f48N8zJRrPdKEZAMEWYeZCyikDA23OG9ptFocmQR49yKlCWJBNnHiaShpJyZATc2U4TZCmqBzZCoSrVp9W3vDWyRVPZCG1UT7feSFmOnapFm3SHA4NVI5rW0u96ieKMQK6ZBiTqTR9YkbwfZCqG21ZBKZBNFy6EmQlPM6cTEZD"; // your token
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

// // ✅ Send interactive buttons for Language selection
// async function sendLanguageSelection(to) {
//   try {
//     await axios.post(
//       `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to,
//         type: "interactive",
//         interactive: {
//           type: "button",
//           body: {
//             text: "🌐 Please select your preferred language:",
//           },
//           action: {
//             buttons: [
//               {
//                 type: "reply",
//                 reply: {
//                   id: "lang_english",
//                   title: "English",
//                 },
//               },
//               {
//                 type: "reply",
//                 reply: {
//                   id: "lang_hindi",
//                   title: "हिंदी",
//                 },
//               },
//             ],
//           },
//         },
//       },
//       { headers: { Authorization: `Bearer ${META_TOKEN}` } }
//     );
//     console.log("✅ Language selection sent!");
//   } catch (err) {
//     console.error(
//       "❌ Error sending interactive message:",
//       err.response?.data || err.message
//     );
//   }
// }

// ✅ API to send manual message via Postman

async function sendLanguageSelection(to) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
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
              reply: { id: "lang_english", title: "English" },
            },
            {
              type: "reply",
              reply: { id: "lang_hindi", title: "हिंदी" },
            },
          ],
        },
      },
    };

    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );

    console.log("✅ Interactive buttons sent to:", to);
  } catch (err) {
    console.error(
      "❌ Error sending interactive message:",
      err.response?.data || err.message
    );
  }
}

app.post("/send", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message'" });
  }

  await sendMessage(to, message);
  res.json({ success: true, to, message });
});

// // ✅ Webhook for incoming messages
// app.post("/webhook", async (req, res) => {
//   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

//   if (message) {
//     const from = message.from;

//     // Case 1: User clicked a button
//     if (message.type === "interactive") {
//       const buttonReply = message.interactive?.button_reply;
//       if (buttonReply) {
//         if (buttonReply.id === "lang_english") {
//           await sendMessage(
//             from,
//             "✅ You selected English. How can I help you?"
//           );
//         } else if (buttonReply.id === "lang_hindi") {
//           await sendMessage(
//             from,
//             "✅ आपने हिंदी चुना। मैं आपकी कैसे मदद कर सकता हूँ?"
//           );
//         }
//       }
//     }
//     // Case 2: User sent a text message
//     else {
//       const msg = message.text?.body?.toLowerCase();
//       console.log("Incoming:", from, msg);

//       if (msg.includes("language")) {
//         await sendLanguageSelection(from); // send interactive buttons
//       } else if (msg.includes("hii") || msg.includes("hi")) {
//         await sendMessage(
//           from,
//           "Hello 👋, type 'language' to choose Hindi/English."
//         );
//       } else if (msg.includes("order")) {
//         await sendMessage(
//           from,
//           "Sure ✅, please provide your order ID or details."
//         );
//       } else {
//         await sendMessage(
//           from,
//           "Sorry, I didn't understand. Type 'language', 'hii', or 'order' to start."
//         );
//       }
//     }
//   }

//   res.sendStatus(200);
// });

// ✅ Webhook for incoming messages
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const profileName =
      req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
      "User";

    // Case 1: User clicked an interactive option
    if (message.type === "interactive") {
      // ✅ Language selection
      const buttonReply = message.interactive?.button_reply;
      if (buttonReply) {
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
        }
      }

      // ✅ List selection
      const listReply = message.interactive?.list_reply;
      if (listReply) {
        console.log("📌 User selected:", listReply);

        if (listReply.id === "your_name") {
          await sendMessage(from, `✅ Your name is ${profileName}`);
        } else if (listReply.id === "order_1") {
          await sendMessage(from, "📦 Order #123 is still pending.");
        } else if (listReply.id === "order_2") {
          await sendMessage(from, "✅ Order #124 was delivered successfully.");
        }
      }
    }

    // Case 2: User sent a text message
    else {
      const msg = message.text?.body?.toLowerCase();
      console.log("Incoming:", from, msg);

      // Step 1: Say Hi → Show Language Buttons
      if (msg.includes("hi") || msg.includes("hii")) {
        await sendLanguageSelection(from); // interactive buttons
      }

      // Step 2: After selecting language → User types "choose"
      else if (msg.includes("choose")) {
        // ✅ Send list message
        const payload = {
          messaging_product: "whatsapp",
          to: from,
          type: "interactive",
          interactive: {
            type: "list",
            header: { type: "text", text: "Welcome 👋" },
            body: {
              text: `Hello ${profileName}, please select from the options below 👇`,
            },
            footer: { text: "Powered by Demo Bot" },
            action: {
              button: "Please select",
              sections: [
                {
                  title: "User Info",
                  rows: [
                    {
                      id: "your_name",
                      title: "👤 Your Name",
                      description: profileName,
                    },
                  ],
                },
                {
                  title: "Order List",
                  rows: [
                    {
                      id: "order_1",
                      title: "📦 Order #123",
                      description: "Dummy order - Pending",
                    },
                    {
                      id: "order_2",
                      title: "📦 Order #124",
                      description: "Dummy order - Delivered",
                    },
                  ],
                },
              ],
            },
          },
        };

        await axios.post(
          `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
          payload,
          { headers: { Authorization: `Bearer ${META_TOKEN}` } }
        );

        console.log("✅ List message sent to:", from);
      } else {
        await sendMessage(
          from,
          "Sorry, I didn't understand. Type 'hi' to start or 'choose' to see options."
        );
      }
    }
  }

  res.sendStatus(200);
});

// // ✅ Webhook handler
// app.post("/webhook", async (req, res) => {
//   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

//   if (message) {
//     const from = message.from; // user number
//     const profileName =
//       req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
//       "User";

//     if (message.type === "text") {
//       const userText = message.text.body.toLowerCase().trim();

//       // When user says "hi" or "hii"
//       if (userText === "hi" || userText === "hii") {
//         const payload = {
//           type: "interactive",
//           interactive: {
//             type: "list",
//             header: {
//               type: "text",
//               text: "Welcome 👋",
//             },
//             body: {
//               text: `Hello ${profileName}, please select from the options below 👇`,
//             },
//             footer: {
//               text: "Powered by Demo Bot",
//             },
//             action: {
//               button: "Select Option",
//               sections: [
//                 {
//                   title: "User Info",
//                   rows: [
//                     {
//                       id: "your_name",
//                       title: `👤 Your Name`,
//                       description: profileName,
//                     },
//                   ],
//                 },
//                 {
//                   title: "Order List",
//                   rows: [
//                     {
//                       id: "order_1",
//                       title: "📦 Order #123",
//                       description: "Dummy order - Pending",
//                     },
//                     {
//                       id: "order_2",
//                       title: "📦 Order #124",
//                       description: "Dummy order - Delivered",
//                     },
//                   ],
//                 },
//               ],
//             },
//           },
//         };

//         await sendMessage(from, payload);
//       }
//     }

//     // Handle selection from list
//     if (message.type === "interactive" && message.interactive.list_reply) {
//       const selection = message.interactive.list_reply;
//       console.log("📌 User selected:", selection);

//       if (selection.id === "your_name") {
//         await sendMessage(from, {
//           type: "text",
//           text: { body: `✅ Your name is ${profileName}` },
//         });
//       } else if (selection.id === "order_1") {
//         await sendMessage(from, {
//           type: "text",
//           text: { body: "📦 Order #123 is still pending." },
//         });
//       } else if (selection.id === "order_2") {
//         await sendMessage(from, {
//           type: "text",
//           text: { body: "✅ Order #124 was delivered successfully." },
//         });
//       }
//     }
//   }

//   res.sendStatus(200);
// });

// ✅ Verify Webhook
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === "myVerify123") {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
