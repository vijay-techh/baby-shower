import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const boy = await pool.query("SELECT COUNT(*) FROM votes WHERE gender='boy'");
    const girl = await pool.query("SELECT COUNT(*) FROM votes WHERE gender='girl'");
    const total = await pool.query("SELECT COUNT(*) FROM votes");

    const boyCount = parseInt(boy.rows[0].count);
    const girlCount = parseInt(girl.rows[0].count);
    const totalCount = parseInt(total.rows[0].count);

    let boyPercent = 0;
    let girlPercent = 0;

    if (totalCount > 0) {
      boyPercent = ((boyCount/totalCount)*100).toFixed(1);
      girlPercent = ((girlCount/totalCount)*100).toFixed(1);
    }

    res.json({ boy: boyPercent, girl: girlPercent });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
}
