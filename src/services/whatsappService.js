// import axios from 'axios';
// import { config } from '../config/config.js';

// const { metaToken, phoneNumberId } = config;

// // Send a normal text message
// export async function sendMessage(to, text) {
//   try {
//     await axios.post(
//       `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
//       {
//         messaging_product: 'whatsapp',
//         to,
//         text: { body: text },
//       },
//       { headers: { Authorization: `Bearer ${metaToken}` } }
//     );
//     console.log('✅ Message sent to:', to);
//   } catch (err) {
//     console.error('❌ Error sending message:', err.response?.data || err.message);
//     throw err;
//   }
// }

// // Send language selection buttons
// export async function sendLanguageSelection(to) {
//   try {
//     const payload = {
//       messaging_product: 'whatsapp',
//       recipient_type: 'individual',
//       to,
//       type: 'interactive',
//       interactive: {
//         type: 'button',
//         body: { text: '🌐 Please select your preferred language:' },
//         action: {
//           buttons: [
//             { type: 'reply', reply: { id: 'lang_english', title: 'English' } },
//             { type: 'reply', reply: { id: 'lang_hindi', title: 'हिंदी' } },
//           ],
//         },
//       },
//     };

//     await axios.post(
//       `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
//       payload,
//       { headers: { Authorization: `Bearer ${metaToken}` } }
//     );
//     console.log('✅ Interactive buttons sent to:', to);
//   } catch (err) {
//     console.error('❌ Error sending interactive message:', err.response?.data || err.message);
//     throw err;
//   }
// }

// // Send list message with user info and order options
// export async function sendListMessage(to, profileName) {
//   try {
//     const payload = {
//       messaging_product: 'whatsapp',
//       to,
//       type: 'interactive',
//       interactive: {
//         type: 'list',
//         header: { type: 'text', text: 'Welcome 👋' },
//         body: { text: `Hello ${profileName}, please select from the options below 👇` },
//         footer: { text: 'Powered by Demo Bot' },
//         action: {
//           button: 'Please select',
//           sections: [
//             {
//               title: 'User Info',
//               rows: [{ id: 'your_name', title: '👤 Your Name', description: profileName }],
//             },
//             {
//               title: 'Order List',
//               rows: [
//                 { id: 'order_1', title: '📦 Order #123', description: 'Dummy order - Pending' },
//                 { id: 'order_2', title: '📦 Order #124', description: 'Dummy order - Delivered' },
//               ],
//             },
//           ],
//         },
//       },
//     };

//     await axios.post(
//       `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
//       payload,
//       { headers: { Authorization: `Bearer ${metaToken}` } }
//     );
//     console.log('✅ List message sent to:', to);
//   } catch (err) {
//     console.error('❌ Error sending list message:', err.response?.data || err.message);
//     throw err;
//   }
// }


import axios from "axios";
import { config } from "../config/config.js";

const { metaToken, phoneNumberId } = config;

// 🔹 Send a normal text message
export async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${metaToken}` } }
    );
    console.log("✅ Message sent to:", to);
  } catch (err) {
    console.error(
      "❌ Error sending message:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// 🔹 Send language selection buttons
export async function sendLanguageSelection(to) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "🌐 Please select your preferred language:" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "lang_english", title: "English" } },
          { type: "reply", reply: { id: "lang_hindi", title: "हिंदी" } },
        ],
      },
    },
  };
  await axios.post(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    payload,
    { headers: { Authorization: `Bearer ${metaToken}` } }
  );
}

// 🔹 Send main menu (Sales Order / Customer Statement)
export async function sendMainMenu(to) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Main Menu" },
      body: { text: "Please select one option 👇" },
      footer: { text: "Powered by Demo Bot" },
      action: {
        button: "Choose",
        sections: [
          {
            title: "Options",
            rows: [
              { id: "sales_order", title: "📑 Sales Order Booking" },
              { id: "customer_statement", title: "📊 Customer Statement" },
            ],
          },
        ],
      },
    },
  };
  await axios.post(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    payload,
    { headers: { Authorization: `Bearer ${metaToken}` } }
  );
}

// // 🔹 Send customer selection list (30 dummy customers)
// export async function sendCustomerList(to) {
//   const customers = Array.from({ length: 30 }, (_, i) => ({
//     id: `customer_${i + 1}`,
//     title: `Customer ${i + 1}`,
//     description: `Address ${i + 1}`,
//   }));

//   const payload = {
//     messaging_product: "whatsapp",
//     to,
//     type: "interactive",
//     interactive: {
//       type: "list",
//       header: { type: "text", text: "Select Customer" },
//       body: { text: "Please choose a customer with address:" },
//       action: {
//         button: "Select Customer",
//         sections: [{ title: "Customers", rows: customers }],
//       },
//     },
//   };

//   await axios.post(
//     `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
//     payload,
//     { headers: { Authorization: `Bearer ${metaToken}` } }
//   );
// }

export async function sendCustomerList(to) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text: "📋 Please select a customer from the list below:",
        },
        action: {
          button: "Select Customer",
          sections: [
            {
              title: "Customers",
              rows: [
                {
                  id: "customer_1",
                  title: "Customer A",
                  description: "Preferred customer",
                },
                {
                  id: "customer_2",
                  title: "Customer B",
                  description: "Regular customer",
                },
                {
                  id: "customer_3",
                  title: "Customer C",
                  description: "New customer",
                },
              ],
            },
          ],
        },
      },
    };

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Customer list sent:", response.data);
  } catch (error) {
    console.error("❌ Error in sendCustomerList:", error.response?.data || error.message);
  }
}


// 🔹 Send item selection list (20 dummy items)
export async function sendItemList(to) {
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: `item_${i + 1}`,
    title: `Item ${i + 1}`,
    description: `Product ${i + 1} details`,
  }));

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Select Items" },
      body: { text: "Please choose an item:" },
      action: {
        button: "Select Item",
        sections: [{ title: "Items", rows: items }],
      },
    },
  };

  await axios.post(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    payload,
    { headers: { Authorization: `Bearer ${metaToken}` } }
  );
}

// 🔹 Send approval (Yes/No)
export async function sendApproval(to) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "Do you approve this order?" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "approve_yes", title: "✅ Yes" } },
          { type: "reply", reply: { id: "approve_no", title: "❌ No" } },
        ],
      },
    },
  };

  await axios.post(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    payload,
    { headers: { Authorization: `Bearer ${metaToken}` } }
  );
}
