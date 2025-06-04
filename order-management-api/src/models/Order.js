import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

class Order {
  static async create(order) {
    const id = uuidv4();
    const {
      customer_name, product_name, quantity,
      address, latitude, longitude,
      delivery_partner_id, preferred_time, priority
    } = order;

    const result = await pool.query(
      `INSERT INTO orders 
        (id, customer_name, product_name, quantity, address, latitude, longitude, delivery_partner_id, preferred_time, priority)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [id, customer_name, product_name, quantity, address, latitude, longitude, delivery_partner_id, preferred_time, priority]
    );

    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(`SELECT * FROM orders`);
    return result.rows;
  }

  static async findByDeliveryPartner(deliveryPartnerId) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE delivery_partner_id = $1`,
      [deliveryPartnerId]
    );
    return result.rows;
  }
}

export default Order;
