const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming db is a configured database connection

// Create a new category
router.post('/create', async (req, res) => {
  const { cate_id, name, description } = req.body;

  if (!cate_id || !name) {
    return res.status(400).json({ error: 'cate_id and name are required' });
  }

  try {
    const query = 'INSERT INTO CATEGORY (cate_id, name, description) VALUES (?, ?, ?)';
    await db.execute(query, [cate_id, name, description]);
    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Add one or more categories to a course
router.post('/add-to-course', async (req, res) => {
  const { course_id, categories } = req.body;

  if (!course_id || !Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ error: 'course_id and categories are required' });
  }

  try {
    const query = 'INSERT INTO COURSE_CATEGORY (course_id, cate_id) VALUES (?, ?)';
    const promises = categories.map(cate_id => db.execute(query, [course_id, cate_id]));
    await Promise.all(promises);

    res.status(201).json({ message: 'Categories added to course successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add categories to course' });
  }
});

// Find courses by category
router.get('/courses/:cate_id', async (req, res) => {
  const { cate_id } = req.params;

  if (!cate_id) {
    return res.status(400).json({ error: 'cate_id is required' });
  }

  try {
    const query = `
      SELECT c.course_id, c.name, c.description, c.price, c.start_date, c.end_date
      FROM COURSE_CATEGORY cc
      JOIN COURSE c ON cc.course_id = c.course_id
      WHERE cc.cate_id = ?
    `;
    const [courses] = await db.execute(query, [cate_id]);

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for the given category' });
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve courses for the category' });
  }
});

// Delete a category
router.delete('/delete/:cate_id', async (req, res) => {
  const { cate_id } = req.params;

  if (!cate_id) {
    return res.status(400).json({ error: 'cate_id is required' });
  }

  try {
    const query = 'DELETE FROM CATEGORY WHERE cate_id = ?';
    const [result] = await db.execute(query, [cate_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Update a category
router.put('/update/:cate_id', async (req, res) => {
  const { cate_id } = req.params;
  const { new_cate_id, name, description } = req.body;

  if (!cate_id || (!new_cate_id && !name && !description)) {
    return res.status(400).json({ error: 'cate_id and at least one field to update are required' });
  }

  try {
    const query = `
      UPDATE CATEGORY
      SET cate_id = COALESCE(?, cate_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description)
      WHERE cate_id = ?
    `;
    const [result] = await db.execute(query, [new_cate_id, name, description, cate_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// List all categories
router.get('/list', async (req, res) => {
  try {
    const query = 'SELECT cate_id, name, description FROM CATEGORY';
    const [categories] = await db.execute(query);

    if (categories.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }

    res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

module.exports = router;