const { Client } = require('pg');
require('dotenv').config({ path: '../../.env.prod.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query('SELECT count(*) FROM "Customer"'))
  .then(res => { console.log("Customers in DB:", res.rows[0].count); client.end(); })
  .catch(console.error);
