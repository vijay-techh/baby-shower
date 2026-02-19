import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const result = await pool.query(
      "SELECT name, gender FROM votes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
}
