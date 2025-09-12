import express from 'express';
import { handleWebhook, handleSendMessage, verifyWebhook, checkController } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/webhook', handleWebhook);
router.get('/webhook', verifyWebhook);
router.post('/send', handleSendMessage);
router.post('/check', checkController);

export default router;