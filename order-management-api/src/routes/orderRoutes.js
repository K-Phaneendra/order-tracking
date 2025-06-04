import express from 'express';
import { createOrder, getAllOrders, getOrdersByPartner } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/delivery-partner/:id', getOrdersByPartner);

export default router;
