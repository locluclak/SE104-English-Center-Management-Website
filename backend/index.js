const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép frontend truy cập
app.use(express.json()); // Đọc JSON từ request body

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
