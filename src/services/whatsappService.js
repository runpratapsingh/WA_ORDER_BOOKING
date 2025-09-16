import axios from "axios";
import { config } from "../config/config.js";
import { fetchCustomers, fetchItems } from "../api/apiconfig.js";
import { userSessions } from "../controllers/webhookController.js";
const { metaToken, phoneNumberId } = config;

async function sendRequest(payload) {
  return axios.post(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    payload,
    { headers: { Authorization: `Bearer ${metaToken}` } }
  );
}

// ✅ Send simple text message
export async function sendMessage(to, text) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    text: { body: text },
  };
  await sendRequest(payload);
}

// ✅ Send language selection
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
  await sendRequest(payload);
}

// ✅ Send main menu
export async function sendMainMenu(to) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Main Menu" },
      body: { text: "Please choose one option 👇" },
      action: {
        button: "Select",
        sections: [
          {
            title: "Options",
            rows: [
              { id: "sales_order", title: "🛒 Sales Order Booking" },
              { id: "customer_statement", title: "📑 Customer Statement" },
            ],
          },
        ],
      },
    },
  };
  await sendRequest(payload);
}

export async function sendCustomerList(to, searchKeyword = null) {
  try {
    const rawCustomers = await fetchCustomers();

    // Filter by search keyword if provided
    let filteredCustomers = rawCustomers;
    if (searchKeyword) {
      filteredCustomers = rawCustomers.filter((c) =>
        (c.Name || "").toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // Take first 10
    // const customers = filteredCustomers.slice(0, 10);

    // // Take only first 10 results
    // const customers = filteredCustomers.slice(0, 10).map((c, index) => ({
    //   id: `customer_${index + 1}`,
    //   title: (c.Name || "Unknown").substring(0, 24), // max 24 chars
    //   description: (c.Post_Code || "").substring(0, 72), // max 72 chars
    // }));

    // Initialize session for this user if not exists
    if (!userSessions[to])
      userSessions[to] = { step: "customer", orderData: {} };
    if (!userSessions[to].customerMap) userSessions[to].customerMap = {};

    const rows = filteredCustomers.map((c, i) => {
      const rowId = `customer_${i + 1}`;
      userSessions[to].customerMap[rowId] = c; // store full customer
      return {
        id: rowId,
        title: (c.Name || "Unknown").substring(0, 24),
        description: (c.Post_Code || "").substring(0, 72),
      };
    });

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: "Select Customer" },
        body: { text: "Please select a customer 👇" },
        action: {
          button: "Choose",
          sections: [
            {
              title: "Customer List",
              rows: rows,
            },
          ],
        },
      },
    };

    await sendRequest(payload);
  } catch (error) {
    console.log(
      "Error in sendCustomerList:",
      error.response?.data || error.message
    );
  }
}

// ✅ Send item list (manual 5 items only)
export async function sendItemList(to, searchKeyword = null) {
  const rawItems = await fetchItems();

  // Filter by search keyword if provided
  let filteredItems = rawItems;
  if (searchKeyword) {
    filteredItems = rawItems.filter((item) =>
      (item.Description || "")
        .toLowerCase()
        .includes(searchKeyword.toLowerCase())
    );
  }

  const items = filteredItems.slice(0, 10).map((it, i) => ({
    id: `item_${i + 1}`,
    title: (it.Description || "Unknown Item").substring(0, 24),
    description: (it.Base_Unit_of_Measure || "").substring(0, 72),
  }));

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Select Item" },
      body: { text: "Please select an item 👇" },
      action: {
        button: "Choose",
        sections: [
          {
            title: "Item List",
            rows: items,
          },
        ],
      },
    },
  };

  await sendRequest(payload);
}

// ✅ Send approval (Yes/No)
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
  await sendRequest(payload);
}

export async function sendPDF(to, pdfUrl, fileName = "statement.pdf") {
  try {
    const url = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "document",
        document: {
          link: pdfUrl, // Publicly accessible URL of the PDF
          filename: fileName, // File name shown in WhatsApp
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.metaToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`📄 PDF sent to ${to}`);
  } catch (error) {
    console.error(
      "❌ Error sending PDF:",
      error.response?.data || error.message
    );
  }
}
