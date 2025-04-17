const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide passenger name']
  },
  age: {
    type: Number,
    required: [true, 'Please provide passenger age']
  },
  seatNumber: {
    type: String,
    required: [true, 'Please provide seat number']
  },
  seatClass: {
    type: String,
    enum: ['Economy', 'Business', 'First'],
    required: [true, 'Please provide seat class']
  }
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  flight: {
    type: mongoose.Schema.ObjectId,
    ref: 'Flight',
    required: [true, 'Booking must belong to a flight']
  },
  passengers: [passengerSchema],
  totalAmount: {
    type: Number,
    required: [true, 'Booking must have a total amount']
  },
  paymentDetails: {
    cardNumber: String,
    cardType: String
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for common queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ flight: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking; 