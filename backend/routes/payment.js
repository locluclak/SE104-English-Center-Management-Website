const express = require('express');
const router = express.Router();
const db = require('../db');

// Update tuition information by T_ID
router.put('/tuition/:id', async (req, res) => {
  const tuitionId = req.params.id;
  const { PRICE, TYPE, DESCRIPTION, STATUS, PAID_DATE } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE TUITION SET PRICE = ?, TYPE = ?, DESCRIPTION = ?, STATUS = ?, PAID_DATE = ? WHERE T_ID = ?`,
      [PRICE, TYPE, DESCRIPTION, STATUS, PAID_DATE, tuitionId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tuition not found' });
    }
    res.json({ message: 'Tuition updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

module.exports = router;