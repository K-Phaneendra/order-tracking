import express from 'express';
import { createPartner, getAllPartners } from '../controllers/deliveryPartnerController.js';

const router = express.Router();

router.post('/', createPartner);
router.get('/', getAllPartners);

export default router;
