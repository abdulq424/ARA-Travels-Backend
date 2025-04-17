const Flight = require('../models/Flight');


exports.searchFlights = async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      class: seatClass,
      minPrice,
      maxPrice,
      airline
    } = req.query;

    
    const query = {};
    
    if (origin) query.origin = new RegExp(origin, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    if (departureDate) {
      const date = new Date(departureDate);
      query.departureDate = {
        $gte: new Date(date.setHours(0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59))
      };
    }
    if(airline) query.airline = new RegExp(airline,'i');

    console.log("origin",origin);
    console.log("destination",destination);
    console.log("departuredate",departureDate);
    console.log("airline : " ,airline)
    console.log("query",query);

    let flights = await Flight.find(query);

    console.log(flights.length);

    
    if (seatClass) {
      flights = flights.map(flight => {
        const availableSeats = flight.seats.filter(seat => 
          seat.isAvailable && seat.class.toLowerCase() === seatClass.toLowerCase()
        );
        const flightData = flight.toObject();
        return {
          ...flightData,
          seats: availableSeats,
          availableSeatsCount: availableSeats.length
        };
      }).filter(flight => flight.availableSeatsCount > 0);
    }
    console.log(seatClass);
    console.log(minPrice);
    console.log(maxPrice);

    if (minPrice || maxPrice) {

      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;

      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid price range values'
        });
      }

      if (min > max) {
        return res.status(400).json({
          status: 'fail',
          message: 'Minimum price cannot be greater than maximum price'
        });
      }

      flights = flights.filter(flight => {
        const availableSeats = flight.seats.filter(seat => seat.isAvailable);
        
        if (availableSeats.length === 0) return false;
        
        
        const minSeatPrice = Math.min(...availableSeats.map(seat => seat.price));
        
        
        return minSeatPrice >= min && minSeatPrice <= max;
      });
    }

    

    res.status(200).json({
      status: 'success',
      results: flights.length,
      data: {
        flights
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


exports.getFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        status: 'fail',
        message: 'No flight found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        flight
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


exports.createFlight = async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      origin,
      destination,
      departureDate,
      arrivalDate,
      duration,
      seats
    } = req.body;

    
    if (!flightNumber || !airline || !origin || !destination || !departureDate || !arrivalDate || !duration) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }

    
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'At least one seat must be provided'
      });
    }

    
    for (const seat of seats) {
      if (!seat.number || !seat.class || !seat.price) {
        return res.status(400).json({
          status: 'fail',
          message: 'Each seat must have a number, class, and price'
        });
      }
      if (seat.price < 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Seat price cannot be negative'
        });
      }
    }

    const flight = await Flight.create({
      flightNumber,
      airline,
      origin,
      destination,
      departureDate,
      arrivalDate,
      duration,
      seats
    });

    res.status(201).json({
      status: 'success',
      data: {
        flight
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


exports.createMultipleFlights = async (req, res) => {
  try {
    const flights = req.body;

    if (!Array.isArray(flights) || flights.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Request body must be a non-empty array of flights'
      });
    }

   
    for (const flight of flights) {
      if (!flight.flightNumber || !flight.airline || !flight.origin || !flight.destination || 
          !flight.departureDate || !flight.arrivalDate || !flight.duration || !flight.seats) {
        return res.status(400).json({
          status: 'fail',
          message: 'Each flight must have all required fields'
        });
      }

      
      if (!Array.isArray(flight.seats) || flight.seats.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Each flight must have at least one seat'
        });
      }

      
      for (const seat of flight.seats) {
        if (!seat.number || !seat.class || !seat.price) {
          return res.status(400).json({
            status: 'fail',
            message: 'Each seat must have a number, class, and price'
          });
        }
        if (seat.price < 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'Seat price cannot be negative'
          });
        }
      }
    }

    const createdFlights = await Flight.insertMany(flights);

    res.status(201).json({
      status: 'success',
      results: createdFlights.length,
      data: {
        flights: createdFlights
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 