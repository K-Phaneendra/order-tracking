import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

class DeliveryPartner {
  static async create(partner) {
    const id = uuidv4();
    const { name, address, latitude, longitude } = partner;

    const result = await pool.query(
      `INSERT INTO delivery_partners (id, name, address, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, name, address, latitude, longitude]
    );

    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(`SELECT * FROM delivery_partners`);
    return result.rows;
  }
}

export default DeliveryPartner;
