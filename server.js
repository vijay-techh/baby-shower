const open = (...args) => import('open').then(m => m.default(...args));
const path = require("path");

const express = require("express");
const cors = require("cors");


const { Pool } = require("pg");

const app = express();
app.use(cors());

// serve html files
app.use(express.static(__dirname));

// open index.html on root
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(cors());
app.use(express.json());

// Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});
// create table if not exists (auto fix)
pool.query(`
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  name TEXT,
  gender TEXT
);
`).then(()=>console.log("Votes table ready"))
.catch(err=>console.log(err));

pool.query("SELECT current_database()", (err, res) => {
  console.log("CONNECTED DB:", res?.rows);
});

// submit vote
app.post("/vote", async (req, res) => {
  try {
    const { name, gender } = req.body;

    if (!name || !gender) {
      return res.status(400).json({ error: "Missing data" });
    }

    await pool.query(
      "INSERT INTO votes(name, gender) VALUES($1,$2)",
      [name, gender]
    );

    res.json({ message: "Vote saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// get percentage
app.get("/results", async (req, res) => {
  try {
    const boy = await pool.query(
      "SELECT COUNT(*) FROM votes WHERE gender='boy'"
    );
    const girl = await pool.query(
      "SELECT COUNT(*) FROM votes WHERE gender='girl'"
    );
    const total = await pool.query("SELECT COUNT(*) FROM votes");

    const boyCount = parseInt(boy.rows[0].count);
    const girlCount = parseInt(girl.rows[0].count);
    const totalCount = parseInt(total.rows[0].count);

    let boyPercent = 0;
    let girlPercent = 0;

    if (totalCount > 0) {
      boyPercent = ((boyCount / totalCount) * 100).toFixed(1);
      girlPercent = ((girlCount / totalCount) * 100).toFixed(1);
    }

    res.json({
      boy: boyPercent,
      girl: girlPercent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// get all votes
app.get("/allvotes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, gender FROM votes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


module.exports = app;
// app.listen(5000, () => {
//   console.log("🚀 Server running on http://localhost:5000");
  
//   // auto open browser
//   open("http://localhost:5000");
// });

// if (require.main === module) {
//   app.listen(5000, () => console.log("Local server running"));
// }
