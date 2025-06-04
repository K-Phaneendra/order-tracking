import DeliveryPartner from '../models/DeliveryPartner.js';

export const createPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.create(req.body);
    res.status(201).json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPartners = async (req, res) => {
  const partners = await DeliveryPartner.findAll();
  res.json(partners);
};
