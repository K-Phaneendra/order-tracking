const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  host: 'order-management-db.ctwukwigot31.ap-south-1.rds.amazonaws.com', // e.g., mydb.abcdefg.us-east-1.rds.amazonaws.com
  port: 5432,
  user: 'uname',
  password: 'yourpassword123',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false, // for RDS without cert validation
  },
});

async function setup() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create delivery_partners table
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_partners (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION
      );
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        customer_name TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        address TEXT NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        delivery_partner_id UUID REFERENCES delivery_partners(id),
        preferred_time TEXT NOT NULL,
        priority TEXT NOT NULL,
        is_order_delivered BOOLEAN DEFAULT FALSE
      );
    `);

    console.log('Tables created.');

    // Insert sample delivery partner
    const deliveryPartnerId = uuidv4();
    await client.query(
      `INSERT INTO delivery_partners (id, name, address, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING;`,
      [deliveryPartnerId, 'Sara', 'Bangalore', 12.9716, 77.5946]
    );

    // Insert sample order
    await client.query(
      `INSERT INTO orders (id, customer_name, product_name, quantity, address, latitude, longitude, delivery_partner_id, preferred_time, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING;`,
      [
        uuidv4(),
        'John Doe',
        'Books',
        2,
        'MG Road, Bangalore',
        12.9718,
        77.5950,
        deliveryPartnerId,
        '9am to 12pm',
        'high',
      ]
    );

    console.log('Sample data inserted.');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

setup();
