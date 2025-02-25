const express = require('express');
const router = express.Router();
const { getBookDetails } = require('../controller/bookController');

// Route to get book details
router.post('/book', async (req, res) => {
  const { bookName } = req.body;

  if (!bookName) {
    return res.status(400).json({ error: 'Book name is required' });
  }

  try {
    const bookDetails = await getBookDetails(bookName);
    res.json(bookDetails);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/wake', (req, res) => {
    res.json({ message: 'Successfully woken up' });
  });

module.exports = router;
