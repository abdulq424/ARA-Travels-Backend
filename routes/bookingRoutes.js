const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.route('/')
  .get(bookingController.getMyBookings)
  .post(bookingController.createBooking);

router.route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.cancelBooking);

module.exports = router; 