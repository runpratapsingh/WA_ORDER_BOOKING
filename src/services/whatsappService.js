import axios from 'axios';
import { config } from '../config/config.js';

const { metaToken, phoneNumberId } = config;

// Send a normal text message
export async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${metaToken}` } }
    );
    console.log('✅ Message sent to:', to);
  } catch (err) {
    console.error('❌ Error sending message:', err.response?.data || err.message);
    throw err;
  }
}

// Send language selection buttons
export async function sendLanguageSelection(to) {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: '🌐 Please select your preferred language:' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'lang_english', title: 'English' } },
            { type: 'reply', reply: { id: 'lang_hindi', title: 'हिंदी' } },
          ],
        },
      },
    };

    await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${metaToken}` } }
    );
    console.log('✅ Interactive buttons sent to:', to);
  } catch (err) {
    console.error('❌ Error sending interactive message:', err.response?.data || err.message);
    throw err;
  }
}

// Send list message with user info and order options
export async function sendListMessage(to, profileName) {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: 'Welcome 👋' },
        body: { text: `Hello ${profileName}, please select from the options below 👇` },
        footer: { text: 'Powered by Demo Bot' },
        action: {
          button: 'Please select',
          sections: [
            {
              title: 'User Info',
              rows: [{ id: 'your_name', title: '👤 Your Name', description: profileName }],
            },
            {
              title: 'Order List',
              rows: [
                { id: 'order_1', title: '📦 Order #123', description: 'Dummy order - Pending' },
                { id: 'order_2', title: '📦 Order #124', description: 'Dummy order - Delivered' },
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
    console.log('✅ List message sent to:', to);
  } catch (err) {
    console.error('❌ Error sending list message:', err.response?.data || err.message);
    throw err;
  }
}