const express = require('express');
const flightController = require('../controllers/flightController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.post('/', flightController.createFlight);
router.post('/bulk', flightController.createMultipleFlights);
router.use(authMiddleware.protect);
router.get('/search', flightController.searchFlights);
router.get('/:id', flightController.getFlight);


module.exports = router; 