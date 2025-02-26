const express = require('express');
const { body, validationResult } = require('express-validator');
const { getBookDetails } = require('../controller/bookController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * @route   POST /api/v1/book
 * @desc    Get book details by name
 * @access  Public
 */
router.post(
  '/book',
  [
    body('bookName')
      .trim()
      .notEmpty()
      .withMessage('Book name is required')
      .isString()
      .withMessage('Book name must be a string')
      .isLength({ min: 2 })
      .withMessage('Book name must be at least 2 characters'),
  ],
  asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookName } = req.body;
    const bookDetails = await getBookDetails(bookName);

    res.status(200).json({
      success: true,
      data: bookDetails,
    });
  })
);


/**
 * @route   POST /api/v1/wake
 * @desc    To wake up instance
 * @access  Public
 */
router.get('/wake', (req, res) => {
    res.json({ message: 'Successfully woken up' });
});


module.exports = router;