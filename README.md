# AQ Travels - Flight Booking API

A RESTful API for a flight booking system built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup/login)
- Flight search with multiple filters
- Flight booking
- Booking management (view/cancel bookings)
- Simple payment simulation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd aq-travels
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
MONGODB_PASSWORD=your_mongodb_password
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Login user

### Flights
- GET /api/flights/search - Search flights with filters
- GET /api/flights/:id - Get flight details

### Bookings
- POST /api/bookings - Create a new booking
- GET /api/bookings/my-bookings - Get user's bookings
- PATCH /api/bookings/:id/cancel - Cancel a booking

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Login User
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Flight Endpoints

#### Search Flights
```
GET /api/flights/search?origin=London&destination=Paris&departureDate=2024-03-20&class=Economy&minPrice=100&maxPrice=500
```

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
{
  "flightId": "flight_id",
  "passengers": [
    {
      "name": "John Doe",
      "age": 30
    }
  ],
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "cardType": "Visa"
  }
}
```

## Error Handling

The API uses conventional HTTP response codes:
- 2xx for successful requests
- 4xx for client errors
- 5xx for server errors

## Security

- JWT based authentication
- Password hashing using bcrypt
- Environment variables for sensitive data
- CORS enabled 