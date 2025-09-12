

import axios from "axios";
import { config } from "../config/config.js";

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

// ✅ Send customer list (manual data instead of loop)
export async function sendCustomerList(to) {
  const customers = [
    { id: "customer_1", title: "Reliance Retail", description: "Mumbai, India" },
    { id: "customer_2", title: "Tata Motors", description: "Pune, India" },
    { id: "customer_3", title: "Aditya Birla Group", description: "Delhi, India" },
    { id: "customer_4", title: "Infosys Ltd", description: "Bangalore, India" },
    { id: "customer_5", title: "Wipro Ltd", description: "Hyderabad, India" },
  ];

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
            rows: customers,
          },
        ],
      },
    },
  };

  await sendRequest(payload);
}

// ✅ Send item list (manual 5 items only)
export async function sendItemList(to) {
  const items = [
    { id: "item_1", title: "Laptop", description: "Electronics" },
    { id: "item_2", title: "Mobile Phone", description: "Smartphone" },
    { id: "item_3", title: "Air Conditioner", description: "Home Appliance" },
    { id: "item_4", title: "Refrigerator", description: "Kitchen Appliance" },
    { id: "item_5", title: "Television", description: "LED TV" },
  ];

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
