import express from 'express';
import { handleWebhook, handleSendMessage, verifyWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/webhook', handleWebhook);
router.get('/webhook', verifyWebhook);
router.post('/send', handleSendMessage);

export default router;