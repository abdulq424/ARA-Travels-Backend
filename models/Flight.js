const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Seat class is required'],
    enum: ['Economy', 'Business', 'First'],
    default: 'Economy'
  },
  price: {
    type: Number,
    required: [true, 'Seat price is required'],
    min: [0, 'Price cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Flight number is required'],
    unique: true,
    trim: true
  },
  airline: {
    type: String,
    required: [true, 'Airline name is required'],
    trim: true
  },
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required']
  },
  arrivalDate: {
    type: Date,
    required: [true, 'Arrival date is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  seats: [seatSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total seats available
flightSchema.virtual('seatsAvailable').get(function() {
  return this.seats.filter(seat => seat.isAvailable).length;
});

// Indexes for common queries
flightSchema.index({ origin: 1, destination: 1 });
flightSchema.index({ departureDate: 1 });
flightSchema.index({ airline: 1 });

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight; 