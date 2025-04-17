const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test the connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Common email styles
const emailStyles = `
  .email-container {
    font-family: 'Arial', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
  }
  .header {
    text-align: center;
    padding: 20px 0;
    background: linear-gradient(135deg, #4C51BF 0%, #6366F1 100%);
    color: white;
    border-radius: 8px 8px 0 0;
    margin-bottom: 30px;
  }
  .content {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .footer {
    text-align: center;
    padding: 20px;
    color: #6B7280;
    font-size: 12px;
    margin-top: 30px;
    border-top: 1px solid #E5E7EB;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, #4C51BF 0%, #6366F1 100%);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
    margin: 20px 0;
    text-align: center;
  }
  .detail-row {
    margin: 10px 0;
    padding: 10px;
    background-color: #F9FAFB;
    border-radius: 4px;
  }
  .detail-label {
    color: #4B5563;
    font-weight: bold;
  }
  .detail-value {
    color: #1F2937;
  }
  .highlight {
    font-size: 24px;
    color: #4C51BF;
    font-weight: bold;
    text-align: center;
    padding: 10px;
    margin: 10px 0;
    background-color: #EEF2FF;
    border-radius: 4px;
  }
`;

exports.sendBookingConfirmation = async (user, booking, flight) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Booking Confirmation - AQ Travels',
    html: `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Booking Confirmation</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #4B5563;">Dear ${user.name},</p>
          <p style="color: #4B5563;">Your flight booking has been confirmed! Here are your booking details:</p>
          
          <h2 style="color: #4C51BF; margin-top: 30px;">Flight Details</h2>
          <div class="detail-row">
            <div class="detail-label">Flight Number</div>
            <div class="detail-value">${flight.flightNumber}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Airline</div>
            <div class="detail-value">${flight.airline}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">From</div>
            <div class="detail-value">${flight.origin}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">To</div>
            <div class="detail-value">${flight.destination}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Departure</div>
            <div class="detail-value">${new Date(flight.departureDate).toLocaleString()}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Arrival</div>
            <div class="detail-value">${new Date(flight.arrivalDate).toLocaleString()}</div>
          </div>

          <h2 style="color: #4C51BF; margin-top: 30px;">Booking Summary</h2>
          <div class="detail-row">
            <div class="detail-label">Booking ID</div>
            <div class="detail-value">${booking._id}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Total Amount</div>
            <div class="detail-value">₨${booking.totalAmount.toLocaleString()}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Number of Passengers</div>
            <div class="detail-value">${booking.passengers.length}</div>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/booking-details/${booking._id}" class="button">
              View Booking Details
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Thank you for choosing AQ Travels!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendBookingCancellation = async (user, booking, flight) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Booking Cancellation - AQ Travels',
    html: `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="header" style="background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);">
          <h1 style="margin: 0; font-size: 28px;">Booking Cancellation</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #4B5563;">Dear ${user.name},</p>
          <p style="color: #4B5563;">Your booking has been cancelled. Here are the details of the cancelled booking:</p>
          
          <h2 style="color: #DC2626; margin-top: 30px;">Flight Details</h2>
          <div class="detail-row">
            <div class="detail-label">Flight Number</div>
            <div class="detail-value">${flight.flightNumber}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Airline</div>
            <div class="detail-value">${flight.airline}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">From</div>
            <div class="detail-value">${flight.origin}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">To</div>
            <div class="detail-value">${flight.destination}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Departure</div>
            <div class="detail-value">${new Date(flight.departureDate).toLocaleString()}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Arrival</div>
            <div class="detail-value">${new Date(flight.arrivalDate).toLocaleString()}</div>
          </div>

          <h2 style="color: #DC2626; margin-top: 30px;">Cancellation Summary</h2>
          <div class="detail-row">
            <div class="detail-label">Booking ID</div>
            <div class="detail-value">${booking._id}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Refund Amount</div>
            <div class="detail-value">₨${booking.totalAmount.toLocaleString()}</div>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #4B5563;">
            The refund process has been initiated and will be completed within 5-7 business days.
          </p>
        </div>
        <div class="footer">
          <p>We're sorry to see you cancel. We hope to serve you again soon!</p>
          <p>If you have any questions about the refund, please contact our support team.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendVerificationEmail = async (user, verificationURL) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Email Verification - AQ Travels',
    html: `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #4B5563;">Dear ${user.name},</p>
          <p style="color: #4B5563;">Welcome to AQ Travels! Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationURL}" class="button">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; text-align: center;">
            This verification link will expire in 24 hours.
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #F3F4F6; border-radius: 6px;">
            <p style="margin: 0; color: #4B5563; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin: 10px 0 0 0; word-break: break-all; color: #4C51BF;">
              ${verificationURL}
            </p>
          </div>
        </div>
        <div class="footer">
          <p>If you didn't create an account with AQ Travels, please ignore this email.</p>
          <p>For security reasons, this link will expire in 24 hours.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendTwoFactorCode = async (user, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Two-Factor Authentication Code - AQ Travels',
    html: `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Two-Factor Authentication</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #4B5563;">Dear ${user.name},</p>
          <p style="color: #4B5563;">Here is your two-factor authentication code:</p>
          
          <div class="highlight">
            ${code}
          </div>
          
          <p style="color: #DC2626; font-weight: bold; text-align: center; margin-top: 20px;">
            This code will expire in 10 minutes.
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #FEF2F2; border-radius: 6px; border: 1px solid #FEE2E2;">
            <p style="margin: 0; color: #991B1B; font-size: 14px;">
              If you didn't request this code, please secure your account immediately by changing your password.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
          <p>For security reasons, never share this code with anyone.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (user, resetURL) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset - AQ Travels',
    html: `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #4B5563;">Dear ${user.name},</p>
          <p style="color: #4B5563;">We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetURL}" class="button">
              Reset Password
            </a>
          </div>
          
          <p style="color: #DC2626; font-weight: bold; text-align: center;">
            This link will expire in 10 minutes.
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #F3F4F6; border-radius: 6px;">
            <p style="margin: 0; color: #4B5563; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin: 10px 0 0 0; word-break: break-all; color: #4C51BF;">
              ${resetURL}
            </p>
          </div>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>For security reasons, this link will expire in 10 minutes.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}; 