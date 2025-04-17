const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const { sendBookingConfirmation, sendBookingCancellation } = require('../services/emailService');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { flightId, passengers } = req.body;
    const userId = req.user._id;

    // Find the flight
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Validate seat availability and calculate total amount
    let totalAmount = 0;
    const selectedSeats = new Set();

    for (const passenger of passengers) {
      // Check if seat is already selected
      if (selectedSeats.has(passenger.seatNumber)) {
        return res.status(400).json({ message: `Seat ${passenger.seatNumber} is already selected` });
      }
      selectedSeats.add(passenger.seatNumber);

      // Find the seat in the flight
      const seat = flight.seats.find(s => s.number === passenger.seatNumber);
      if (!seat) {
        return res.status(400).json({ message: `Seat ${passenger.seatNumber} not found` });
      }

      // Check seat availability
      if (!seat.isAvailable) {
        return res.status(400).json({ message: `Seat ${passenger.seatNumber} is not available` });
      }

      // Check seat class
      if (seat.class !== passenger.seatClass) {
        return res.status(400).json({ message: `Seat ${passenger.seatNumber} class mismatch` });
      }

      totalAmount += seat.price;
    }

    // Create the booking
    const booking = await Booking.create({
      user: userId,
      flight: flightId,
      passengers,
      totalAmount,
      paymentStatus: 'Pending'
    });

    // Update seat availability
    for (const passenger of passengers) {
      const seat = flight.seats.find(s => s.number === passenger.seatNumber);
      seat.isAvailable = false;
    }
    await flight.save();

    // Send confirmation email
    const user = await User.findById(userId);
    await sendBookingConfirmation(user, booking, flight);

    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('flight')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { bookings }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single booking by ID
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }

    // Check if the booking belongs to the logged-in user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this booking'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    // Update seat availability
    if (booking.flight) {
      for (const passenger of booking.passengers) {
        const seat = booking.flight.seats.find(s => s.number === passenger.seatNumber);
        if (seat) {
          seat.isAvailable = true;
        }
      }
      await booking.flight.save();
    }

    // Send cancellation email
    const user = await User.findById(req.user._id);
    if (user) {
      await sendBookingCancellation(user, booking, booking.flight);
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 