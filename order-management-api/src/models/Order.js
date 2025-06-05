import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class Order {
  static async create(order) {
    const id = uuidv4();
    const {
      customer_name,
      product_name,
      quantity,
      address,
      latitude,
      longitude,
      delivery_partner_id,
      preferred_time,
      priority,
      is_order_delivered,
    } = order;

    const result = await pool.query(
      `INSERT INTO orders 
        (id, customer_name, product_name, quantity, address, latitude, longitude, delivery_partner_id, preferred_time, priority, is_order_delivered)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        id,
        customer_name,
        product_name,
        quantity,
        address,
        latitude,
        longitude,
        delivery_partner_id,
        preferred_time,
        priority,
        is_order_delivered,
      ]
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

  static async markAsDelivered(orderId) {
    try {
      // add column is_order_delivered, in the table if the column is not present
      await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_order_delivered BOOLEAN DEFAULT FALSE;')
      const result = await pool.query(
        `UPDATE orders
       SET is_order_delivered = TRUE
       WHERE id = $1
       RETURNING *`,
        [orderId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      return result.rows[0]
    } catch (error) {
      console.error("Error marking order as delivered:", error.message);
      return []
    }
  }
}

export default Order;
