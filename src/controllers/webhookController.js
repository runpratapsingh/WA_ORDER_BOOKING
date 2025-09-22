// // import {
// //   callSoapAPI,
// //   fetchSalesPersons,
// //   fetchCustomers,
// // } from "../api/apiconfig.js";
// // import { config } from "../config/config.js";
// // import {
// //   sendMessage,
// //   sendMainMenu,
// //   sendCustomerList,
// //   sendItemList,
// //   sendApproval,
// //   sendPDF,
// // } from "../services/whatsappService.js";
// // import {
// //   getSession,
// //   updateSession,
// //   resetSession,
// // } from "../utils/sessionManager.js";

// // const processedMessages = new Set();

// // // ------------------- MAIN WEBHOOK HANDLER -------------------
// // export async function handleWebhook(req, res) {
// //   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
// //   const from = message?.from;

// //   if (!message) return res.sendStatus(200);

// //   // ✅ Deduplicate
// //   if (processedMessages.has(message.id)) return res.sendStatus(200);
// //   processedMessages.add(message.id);

// //   const profileName =
// //     req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
// //     "User";

// //   // ✅ Always fetch session from DB
// //   let session = await getSession(from);

// //   // ------------------- INTERACTIVE -------------------
// //   if (message.type === "interactive") {
// //     const buttonReply = message.interactive?.button_reply;
// //     const listReply = message.interactive?.list_reply;

// //     if (buttonReply) {
// //       if (buttonReply.id === "approve_yes") {
// //         console.log("Order approved:", session);
// //         await sendMessage(from, "✅ Order Created successfully.");
// //       } else if (buttonReply.id === "approve_no") {
// //         await sendMessage(from, "❌ Order cancelled.");
// //         session = await resetSession(from);
// //       }
// //     }

// //     if (listReply) {
// //       if (listReply.id === "sales_order") {
// //         session = await updateSession(from, { step: "search_customer" });
// //         await sendMessage(from, "🔍 Please type the customer name to search:");
// //       } else if (listReply.id === "customer_statement") {
// //         // Step 1: Ask for customer name
// //         session = await updateSession(from, {
// //           step: "search_customer_statement",
// //         });
// //         await sendMessage(
// //           from,
// //           "🔍 Please type the customer name for the statement:"
// //         );
// //       } else if (listReply.id.startsWith("customer_")) {
// //         // ✅ Customer selected
// //         if (session.step === "customer_statement") {
// //           const selectedCustomer = session.customerMap[listReply.id];
// //           const pdfUrl =
// //             "https://morth.nic.in/sites/default/files/dd12-13_0.pdf";
// //           await sendPDF(from, pdfUrl, `${selectedCustomer.Name}_Statement.pdf`);
// //           session = await resetSession(from);
// //         } else {
// //           // Regular Sales Order Flow
// //           const orderId = `SO/${new Date().getFullYear()}/${Math.floor(
// //             Math.random() * 1000
// //           )}`;
// //           const selectedCustomer = session.customerMap[listReply.id];
// //           session = await updateSession(from, {
// //             step: "search_item",
// //             "orderData.orderId": orderId,
// //             selectedCustomer,
// //           });
// //           await sendMessage(from, "🔍 Please type the item name to search:");
// //         }
// //       } else if (listReply.id.startsWith("item_")) {
// //         session = await updateSession(from, {
// //           step: "quantity",
// //           "orderData.item": listReply.title,
// //         });
// //         await sendMessage(
// //           from,
// //           `🛒 You selected ${listReply.title}. Please enter quantity (e.g., 5).`
// //         );
// //       }
// //     }
// //   }

// //   // ------------------- TEXT -------------------
// //   if (message.type === "text") {
// //     const msg = message.text.body.toLowerCase().trim();

// //     if (msg.includes("hi")) {
// //       const last10 = from.slice(-10);
// //       const authResponse = await callSoapAPI(last10);

// //       if (authResponse === "MOB NO. DOES NOT EXIST") {
// //         await sendMessage(
// //           from,
// //           "❌ Your mobile number is not registered in BC365. Please contact admin."
// //         );
// //       } else {
// //         if (!session.isAuthenticated) {
// //           await updateSession(from, { isAuthenticated: true, step: "start" });
// //           const greeting = `Hello ${profileName}! 👋\nWelcome to the Sales Order Bot.`;
// //           await sendMessage(from, greeting);
// //           await sendMessage(
// //             from,
// //             "✅ You are authenticated. Type 'menu' to see options."
// //           );
// //         } else {
// //           await sendMessage(from, "Type 'menu' to see options.");
// //         }
// //       }
// //     } else if (msg === "menu") {
// //       await sendMainMenu(from);
// //       await updateSession(from, { step: "menu" });
// //     } else if (session.step === "search_customer") {
// //       await sendCustomerList(from, msg);
// //       await updateSession(from, { step: "customer" });
// //     } else if (session.step === "search_item") {
// //       await sendItemList(from, msg);
// //       await updateSession(from, { step: "item" });
// //     } else if (session.step === "quantity") {
// //       const qty = parseInt(message.text.body, 10);
// //       if (!isNaN(qty)) {
// //         await updateSession(from, {
// //           step: "approval",
// //           "orderData.quantity": qty,
// //         });

// //         await sendMessage(
// //           from,
// //           `📦 Order: ${session.orderData.item}, Qty: ${qty}, Customer: ${session.selectedCustomer?.Name}`
// //         );

// //         await sendApproval(from);
// //       } else {
// //         await sendMessage(from, "❌ Please enter a valid number for quantity.");
// //       }
// //     } else if (session.step === "search_customer_statement") {
// //       // ✅ User typed customer name for statement search
// //       await sendCustomerList(from, msg);
// //       await updateSession(from, { step: "customer_statement" });
// //     } else {
// //       await sendMessage(
// //         from,
// //         "Type 'hi' to start again because your session has expired."
// //       );
// //     }
// //   }

// //   res.sendStatus(200);
// // }

// // // ------------------- SEND MESSAGE API -------------------
// // export async function handleSendMessage(req, res) {
// //   const { to, message } = req.body;

// //   if (!to || !message) {
// //     return res.status(400).json({ error: "Missing 'to' or 'message'" });
// //   }

// //   try {
// //     await sendMessage(to, message);
// //     res.json({ success: true, to, message });
// //   } catch (err) {
// //     res.status(500).json({ error: "Failed to send message" });
// //   }
// // }

// // // ------------------- CONTROLLER CHECK -------------------
// // export async function checkController(req, res) {
// //   const items = await fetchSalesPersons();
// //   console.log("SOAP API items:", items);
// //   res.json({ status: "Controller is working", items });
// // }

// // // ------------------- VERIFY WEBHOOK -------------------
// // export function verifyWebhook(req, res) {
// //   console.log(
// //     "Webhook verification request:",
// //     config.webhookVerifyToken,
// //     req.query
// //   );
// //   if (req.query["hub.verify_token"] === config.webhookVerifyToken) {
// //     res.send(req.query["hub.challenge"]);
// //   } else {
// //     res.sendStatus(403);
// //   }
// // }

// import {
//   callSoapAPI,
//   fetchSalesPersons,
//   fetchCustomers,
// } from "../api/apiconfig.js";
// import { config } from "../config/config.js";
// import {
//   sendMessage,
//   sendMainMenu,
//   sendCustomerList,
//   sendItemList,
//   sendApproval,
//   sendPDF,
// } from "../services/whatsappService.js";
// import {
//   getSession,
//   updateSession,
//   resetSession,
// } from "../utils/sessionManager.js";

// const processedMessages = new Set();

// // ------------------- MAIN WEBHOOK HANDLER -------------------
// export async function handleWebhook(req, res) {
//   const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
//   const from = message?.from;

//   if (!message) return res.sendStatus(200);

//   // ✅ Deduplicate
//   if (processedMessages.has(message.id)) return res.sendStatus(200);
//   processedMessages.add(message.id);

//   const profileName =
//     req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
//     "User";

//   // ✅ Always fetch session from DB
//   let session = await getSession(from);

//   // ------------------- INTERACTIVE -------------------
//   if (message.type === "interactive") {
//     const buttonReply = message.interactive?.button_reply;
//     const listReply = message.interactive?.list_reply;

//     if (buttonReply) {
//       if (buttonReply.id === "approve_yes") {
//         console.log("Order approved:", session);
//         await sendMessage(from, "✅ Order Created successfully.");
//       } else if (buttonReply.id === "approve_no") {
//         await sendMessage(from, "❌ Order cancelled.");
//         session = await resetSession(from);
//       }
//     }

//     if (listReply) {
//       if (listReply.id === "sales_order") {
//         session = await updateSession(from, { step: "search_customer" });
//         await sendMessage(from, "🔍 Please type the customer name to search:");
//       } else if (listReply.id === "customer_statement") {
//         // Step 1: Ask for customer name
//         session = await updateSession(from, {
//           step: "search_customer_statement",
//         });
//         await sendMessage(
//           from,
//           "🔍 Please type the customer name for the statement:"
//         );
//       } else if (listReply.id.startsWith("customer_")) {
//         // ✅ Customer selected for statement
//         if (session.step === "customer_statement") {
//           const selectedCustomer = session.customerMap[listReply.id];
//           session = await updateSession(from, {
//             step: "from_date",
//             selectedCustomer,
//           });
//           await sendMessage(
//             from,
//             `📅 You selected *${selectedCustomer.Name}*. Please enter the From Date (DD-MM-YYYY):`
//           );
//         } else {
//           // Regular Sales Order Flow
//           const orderId = `SO/${new Date().getFullYear()}/${Math.floor(
//             Math.random() * 1000
//           )}`;
//           const selectedCustomer = session.customerMap[listReply.id];
//           session = await updateSession(from, {
//             step: "search_item",
//             "orderData.orderId": orderId,
//             selectedCustomer,
//           });
//           await sendMessage(from, "🔍 Please type the item name to search:");
//         }
//       } else if (listReply.id.startsWith("item_")) {
//         session = await updateSession(from, {
//           step: "quantity",
//           "orderData.item": listReply.title,
//         });
//         await sendMessage(
//           from,
//           `🛒 You selected ${listReply.title}. Please enter quantity (e.g., 5).`
//         );
//       }
//     }
//   }

//   // ------------------- TEXT -------------------
//   if (message.type === "text") {
//     const msg = message.text.body.trim();

//     if (msg.toLowerCase().includes("hi")) {
//       const last10 = from.slice(-10);
//       const authResponse = await callSoapAPI(last10);

//       if (authResponse === "MOB NO. DOES NOT EXIST") {
//         await sendMessage(
//           from,
//           "❌ Your mobile number is not registered in BC365. Please contact admin."
//         );
//       } else {
//         if (!session.isAuthenticated) {
//           await updateSession(from, { isAuthenticated: true, step: "start" });
//           const greeting = `Hello ${profileName}! 👋\nWelcome to the Sales Order Bot.`;
//           await sendMessage(from, greeting);
//           await sendMessage(
//             from,
//             "✅ You are authenticated. Type 'menu' to see options."
//           );
//         } else {
//           await sendMessage(from, "Type 'menu' to see options.");
//         }
//       }
//     } else if (msg.toLowerCase() === "menu") {
//       await sendMainMenu(from);
//       await updateSession(from, { step: "menu" });
//     } else if (session.step === "search_customer") {
//       await sendCustomerList(from, msg);
//       await updateSession(from, { step: "customer" });
//     } else if (session.step === "search_item") {
//       await sendItemList(from, msg);
//       await updateSession(from, { step: "item" });
//     } else if (session.step === "quantity") {
//       const qty = parseInt(msg, 10);
//       if (!isNaN(qty)) {
//         await updateSession(from, {
//           step: "approval",
//           "orderData.quantity": qty,
//         });

//         await sendMessage(
//           from,
//           `📦 Order: ${session.orderData.item}, Qty: ${qty}, Customer: ${session.selectedCustomer?.Name}`
//         );

//         await sendApproval(from);
//       } else {
//         await sendMessage(from, "❌ Please enter a valid number for quantity.");
//       }
//     } else if (session.step === "search_customer_statement") {
//       // ✅ User typed customer name for statement search
//       await sendCustomerList(from, msg);
//       await updateSession(from, { step: "customer_statement" });
//     } else if (session.step === "from_date") {
//       // ✅ Capture From Date
//       await updateSession(from, { step: "to_date", fromDate: msg });
//       await sendMessage(from, "📅 Please enter the To Date (DD-MM-YYYY):");
//     } else if (session.step === "to_date") {
//       // ✅ Capture To Date, send PDF
//       await updateSession(from, { toDate: msg });

//       console.log("jshfkjahfskajhfkjas", session);

//       const { selectedCustomer, fromDate, toDate } = session;
//       const pdfUrl = "https://morth.nic.in/sites/default/files/dd12-13_0.pdf";

//       await sendMessage(
//         from,
//         `📑 Generating statement for *${selectedCustomer.Name}*\nFrom: ${fromDate}\nTo: ${toDate}`
//       );
//       await sendPDF(from, pdfUrl, `${selectedCustomer.Name}_Statement.pdf`);

//       // ✅ Reset session
//       session = await resetSession(from);
//     } else {
//       await sendMessage(
//         from,
//         "Type 'hi' to start again because your session has expired."
//       );
//     }
//   }

//   res.sendStatus(200);
// }

// // ------------------- SEND MESSAGE API -------------------
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

// // ------------------- CONTROLLER CHECK -------------------
// export async function checkController(req, res) {
//   const items = await fetchSalesPersons();
//   console.log("SOAP API items:", items);
//   res.json({ status: "Controller is working", items });
// }

// // ------------------- VERIFY WEBHOOK -------------------
// export function verifyWebhook(req, res) {
//   console.log(
//     "Webhook verification request:",
//     config.webhookVerifyToken,
//     req.query
//   );
//   if (req.query["hub.verify_token"] === config.webhookVerifyToken) {
//     res.send(req.query["hub.challenge"]);
//   } else {
//     res.sendStatus(403);
//   }
// }
import {
  callSoapAPI,
  fetchSalesPersons,
  fetchCustomers,
} from "../api/apiconfig.js";
import { config } from "../config/config.js";
import {
  sendMessage,
  sendMainMenu,
  sendCustomerList,
  sendItemList,
  sendApproval,
  sendPDF,
} from "../services/whatsappService.js";
import {
  getSession,
  updateSession,
  resetSession,
} from "../utils/sessionManager.js";

const processedMessages = new Set();

// ------------------- MAIN WEBHOOK HANDLER -------------------
export async function handleWebhook(req, res) {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from;

  if (!message) return res.sendStatus(200);

  // ✅ Deduplicate
  if (processedMessages.has(message.id)) return res.sendStatus(200);
  processedMessages.add(message.id);

  const profileName =
    req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
    "User";

  // ✅ Always fetch session from DB
  let session = await getSession(from);

  // ------------------- INTERACTIVE -------------------
  if (message.type === "interactive") {
    const buttonReply = message.interactive?.button_reply;
    const listReply = message.interactive?.list_reply;

    if (buttonReply) {
      if (buttonReply.id === "approve_yes") {
        console.log("Order approved:", session);
        await sendMessage(from, "✅ Order Created successfully.");
      } else if (buttonReply.id === "approve_no") {
        await sendMessage(from, "❌ Order cancelled.");
        session = await resetSession(from);
      }
    }

    if (listReply) {
      if (listReply.id === "sales_order") {
        session = await updateSession(from, { step: "search_customer" });
        await sendMessage(from, "🔍 Please type the customer name to search:");
      } else if (listReply.id === "customer_statement") {
        // Step 1: Ask for customer name
        session = await updateSession(from, {
          step: "search_customer_statement",
        });
        await sendMessage(
          from,
          "🔍 Please type the customer name for the statement:"
        );
      } else if (listReply.id.startsWith("customer_")) {
        // ✅ Customer selected
        if (session.step === "customer_statement") {
          const selectedCustomer = session.customerMap[listReply.id];
          session = await updateSession(from, {
            step: "from_date",
            selectedCustomer,
          });
          await sendMessage(
            from,
            `📅 Please enter the *From Date* (DD-MM-YYYY) for ${selectedCustomer.Name}:`
          );
        } else {
          // Regular Sales Order Flow
          const orderId = `SO/${new Date().getFullYear()}/${Math.floor(
            Math.random() * 1000
          )}`;
          const selectedCustomer = session.customerMap[listReply.id];
          session = await updateSession(from, {
            step: "search_item",
            "orderData.orderId": orderId,
            selectedCustomer,
          });
          await sendMessage(from, "🔍 Please type the item name to search:");
        }
      } else if (listReply.id.startsWith("item_")) {
        session = await updateSession(from, {
          step: "quantity",
          "orderData.item": listReply.title,
        });
        await sendMessage(
          from,
          `🛒 You selected ${listReply.title}. Please enter quantity (e.g., 5).`
        );
      }
    }
  }

  // ------------------- TEXT -------------------
  if (message.type === "text") {
    const msg = message.text.body.trim();

    if (msg.toLowerCase().includes("hi")) {
      const last10 = from.slice(-10);
      const authResponse = await callSoapAPI(last10);

      if (authResponse === "MOB NO. DOES NOT EXIST") {
        await sendMessage(
          from,
          "❌ Your mobile number is not registered in BC365. Please contact admin."
        );
      } else {
        if (!session.isAuthenticated) {
          await updateSession(from, { isAuthenticated: true, step: "start" });
          const greeting = `Hello ${profileName}! 👋\nWelcome to the Sales Order Bot.`;
          await sendMessage(from, greeting);
          await sendMessage(
            from,
            "✅ You are authenticated. Type 'menu' to see options."
          );
        } else {
          await sendMessage(from, "Type 'menu' to see options.");
        }
      }
    } else if (msg.toLowerCase() === "menu") {
      await sendMainMenu(from);
      await updateSession(from, { step: "menu" });

      // ------------------- SALES ORDER FLOW -------------------
    } else if (session.step === "search_customer") {
      await sendCustomerList(from, msg);
      await updateSession(from, { step: "customer" });
    } else if (session.step === "search_item") {
      await sendItemList(from, msg);
      await updateSession(from, { step: "item" });
    } else if (session.step === "quantity") {
      const qty = parseInt(msg, 10);
      if (!isNaN(qty)) {
        await updateSession(from, {
          step: "approval",
          "orderData.quantity": qty,
        });

        await sendMessage(
          from,
          `📦 Order: ${session.orderData.item}, Qty: ${qty}, Customer: ${session.selectedCustomer?.Name}`
        );

        await sendApproval(from);
      } else {
        await sendMessage(from, "❌ Please enter a valid number for quantity.");
      }

      // ------------------- CUSTOMER STATEMENT FLOW -------------------
    } else if (session.step === "search_customer_statement") {
      await sendCustomerList(from, msg);
      await updateSession(from, { step: "customer_statement" });
    } else if (session.step === "from_date") {
      // ✅ Save From Date
      session = await updateSession(from, { step: "to_date", fromDate: msg });
      await sendMessage(
        from,
        `📅 From Date set to *${msg}*.\nNow, please enter the *To Date* (DD-MM-YYYY):`
      );
    } else if (session.step === "to_date") {
      // ✅ Save To Date and generate statement
      session = await updateSession(from, {
        step: "generate_statement",
        toDate: msg,
      });

      const customer = session.selectedCustomer;
      const fromDate = session.fromDate;
      const toDate = msg;

      await sendMessage(
        from,
        `📑 Generating statement for *${customer.Name}*\nFrom: ${fromDate}\nTo: ${toDate}`
      );

      // Dummy PDF (replace with real API)
      const pdfUrl = "https://morth.nic.in/sites/default/files/dd12-13_0.pdf";
      await sendPDF(from, pdfUrl, `${customer.Name}_Statement.pdf`);

      session = await resetSession(from);
    } else {
      await sendMessage(
        from,
        "Type 'hi' to start again because your session has expired."
      );
    }
  }

  res.sendStatus(200);
}

// ------------------- SEND MESSAGE API -------------------
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

// ------------------- CONTROLLER CHECK -------------------
export async function checkController(req, res) {
  const items = await fetchSalesPersons();
  console.log("SOAP API items:", items);
  res.json({ status: "Controller is working", items });
}

// ------------------- VERIFY WEBHOOK -------------------
export function verifyWebhook(req, res) {
  console.log(
    "Webhook verification request:",
    config.webhookVerifyToken,
    req.query
  );
  if (req.query["hub.verify_token"] === config.webhookVerifyToken) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
}
