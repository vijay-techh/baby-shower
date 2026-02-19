import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, gender } = req.body;

    if (!name || !gender) {
      return res.status(400).json({ error: "Missing data" });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes(
        id SERIAL PRIMARY KEY,
        name TEXT,
        gender TEXT
      )
    `);

    await pool.query(
      "INSERT INTO votes(name, gender) VALUES($1,$2)",
      [name, gender]
    );

    res.json({ message: "Vote saved" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
}
