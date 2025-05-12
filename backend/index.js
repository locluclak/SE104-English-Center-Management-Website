const express = require('express');
const cors = require('cors');
const db = require('./db'); // kết nối mysql
const authRoutes = require('./routes/auth'); // <-- thêm dòng này

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', authRoutes); // <-- gắn router có /signup, /login

app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM courses');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
