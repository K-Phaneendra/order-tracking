import express from 'express';
import { createOrder, getAllOrders, getOrdersByPartner, markOrderAsDelivered } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/delivery-partner/:id', getOrdersByPartner);
router.patch('/:id/deliver', markOrderAsDelivered);

export default router;
