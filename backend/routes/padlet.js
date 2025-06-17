const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Cấu hình upload chỉ cho phép file đính kèm
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận các file thông thường (không phải audio)
    if (file.fieldname === 'attachments') {
      cb(null, true);
    } else {
      cb(new Error('Loại file không được hỗ trợ'), false);
    }
  }
}).fields([
  { name: 'attachments', maxCount: 10 } // Cho phép tối đa 10 file đính kèm
]);

// Hàm helper để chuẩn bị dữ liệu file cho database
const prepareFileInsert = (padletId, file) => [
  padletId,
  file.originalname,
  file.mimetype,
  `/uploads/${file.filename}`, // Lưu đường dẫn tương đối
  'attachment' // Loại media luôn là attachment
];

// Tạo padlet mới
router.post('/create', (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { name, content, ownerId, color } = req.body;
    if (!name || !content || !ownerId) {
      return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
    }

    try {
      // Tạo padlet mới
      const [result] = await db.execute(
        'INSERT INTO PADLET (NAME, CONTENT, CREATETIME, OWNERID, COLOR) VALUES (?, ?, NOW(), ?, ?)',
        [name, content, ownerId, color || '#ffffff']
      );

      const padletId = result.insertId;
      const files = [];

      // Xử lý file đính kèm nếu có
      if (req.files?.attachments) {
        req.files.attachments.forEach(file => {
          files.push(prepareFileInsert(padletId, file));
        });

        if (files.length > 0) {
          await db.query(
            'INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH, MEDIATYPE) VALUES ?',
            [files]
          );
        }
      }

      res.status(201).json({ 
        message: 'Tạo ghi chú thành công', 
        padletId 
      });
    } catch (err) {
      console.error('Lỗi khi tạo ghi chú:', err);
      res.status(500).json({ error: 'Lỗi khi tạo ghi chú' });
    }
  });
});

// Chỉnh sửa padlet
router.put('/edit/:padletId', (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { padletId } = req.params;
    const { name, content, color, removeAttachment } = req.body;

    try {
      // Cập nhật thông tin padlet
      await db.execute(
        'UPDATE PADLET SET NAME = COALESCE(?, NAME), CONTENT = COALESCE(?, CONTENT), COLOR = COALESCE(?, COLOR) WHERE ID = ?',
        [name, content, color, padletId]
      );

      // Xử lý xóa file đính kèm nếu có
      if (removeAttachment) {
        const removeList = JSON.parse(removeAttachment);
        if (Array.isArray(removeList) && removeList.length > 0) {
          // Lấy thông tin file để xóa vật lý
          const [filesToDelete] = await db.query(
            'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ? AND ID IN (?)',
            [padletId, removeList]
          );

          // Xóa file vật lý
          for (const file of filesToDelete) {
            try {
              const filePath = path.join(__dirname, '../..', file.FILEPATH);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (unlinkErr) {
              console.error('Lỗi khi xóa file:', unlinkErr);
            }
          }

          // Xóa record trong database
          await db.query(
            'DELETE FROM MEDIAFILE WHERE NOTEID = ? AND ID IN (?)',
            [padletId, removeList]
          );
        }
      }

      // Thêm file đính kèm mới nếu có
      const files = [];
      if (req.files?.attachments) {
        req.files.attachments.forEach(file => {
          files.push(prepareFileInsert(padletId, file));
        });

        if (files.length > 0) {
          await db.query(
            'INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH, MEDIATYPE) VALUES ?',
            [files]
          );
        }
      }

      res.status(200).json({ message: 'Cập nhật ghi chú thành công' });
    } catch (err) {
      console.error('Lỗi khi cập nhật ghi chú:', err);
      res.status(500).json({ error: 'Lỗi khi cập nhật ghi chú' });
    }
  });
});

// Lấy danh sách padlet
router.get('/notes/:ownerId', async (req, res) => {
  const { ownerId } = req.params;

  try {
    const [padlets] = await db.query(`
      SELECT 
        p.ID AS id,
        p.NAME AS padletName,
        p.CONTENT AS padletContent,
        p.COLOR AS color,
        p.CREATETIME AS createTime,
        p.OWNERID AS ownerId,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', m.ID,
            'fileName', m.FILENAME,
            'fileType', m.TYPE,
            'mediaType', m.MEDIATYPE,
            'downloadUrl', m.FILEPATH
          )
        ) AS attachmentsData
      FROM PADLET p
      LEFT JOIN MEDIAFILE m ON p.ID = m.NOTEID
      WHERE p.OWNERID = ?
      GROUP BY p.ID
      ORDER BY p.CREATETIME DESC
    `, [ownerId]);

    res.status(200).json({ padlets });
  } catch (err) {
    console.error('Lỗi khi tải ghi chú:', err);
    res.status(500).json({ error: 'Lỗi khi tải ghi chú' });
  }
});

// Xóa padlet
router.delete('/delete/:padletId', async (req, res) => {
  const { padletId } = req.params;

  try {
    // Lấy danh sách file đính kèm để xóa vật lý
    const [files] = await db.query(
      'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ?',
      [padletId]
    );

    // Xóa file vật lý
    for (const file of files) {
      try {
        const filePath = path.join(__dirname, '../..', file.FILEPATH);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (unlinkErr) {
        console.error('Lỗi khi xóa file:', unlinkErr);
      }
    }

    // Xóa padlet và các file đính kèm trong database
    await db.query('DELETE FROM PADLET WHERE ID = ?', [padletId]);
    res.status(200).json({ message: 'Đã xoá ghi chú và file đính kèm' });
  } catch (err) {
    console.error('Lỗi khi xoá ghi chú:', err);
    res.status(500).json({ error: 'Lỗi khi xoá ghi chú' });
  }
});

module.exports = router;