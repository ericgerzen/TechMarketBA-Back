import { Pool } from "pg";
import 'dotenv/config';

export const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT) || 5432,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false, // optional improvement
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => console.error('PostgreSQL connection error:', err));
