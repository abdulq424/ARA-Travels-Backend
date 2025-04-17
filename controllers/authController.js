const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const speakeasy = require('speakeasy');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone
    });

    // Create email verification token
    const verificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // Send verification email with frontend URL
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationURL = `${frontendURL}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(newUser, verificationURL);

    // Remove sensitive data from output
    newUser.password = undefined;
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;

    res.status(201).json({
      status: 'success',
      message: 'Verification email sent. Please check your email to verify your account.',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please verify your email first'
      });
    }

    if (user.twoFactorEnabled) {
      // Generate and send 2FA code via email
      const twoFactorCode = user.generateEmailTwoFactorCode();
      await user.save({ validateBeforeSave: false });
      await emailService.sendTwoFactorCode(user, twoFactorCode);
      
      return res.status(200).json({
        status: 'success',
        message: 'Two-factor authentication required',
        twoFactorRequired: true
      });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.verifyTwoFactor = async (req, res) => {
  try {
    console.log(req.body);
    const { email, code } = req.body.otp;
    console.log(email, code);
    

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email address'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        status: 'fail',
        message: '2FA is not enabled for this account'
      });
    }

    // Verify the email-based 2FA code
    const isValid = user.verifyEmailTwoFactorCode(code);
    await user.save({ validateBeforeSave: false });

    if (!isValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired verification code'
      });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email address'
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user, resetURL);

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email address'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already verified'
      });
    }

    // Check if last verification email was sent less than 5 minutes ago
    if (user.emailVerificationExpires && 
        user.emailVerificationExpires > Date.now() - 5 * 60 * 1000) {
      return res.status(429).json({
        status: 'fail',
        message: 'Please wait 5 minutes before requesting another verification email'
      });
    }

    // Create new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationURL = `${frontendURL}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(user, verificationURL);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(400).json({
      status: 'fail',
      message: 'Failed to resend verification email'
    });
  }
};

exports.setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        status: 'fail',
        message: '2FA is already enabled'
      });
    }

    const secret = user.generateTwoFactorSecret();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        secret: secret.base32,
        qrCode: secret.otpauth_url
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.verifyTwoFactorSetup = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorTempSecret');

    if (!user.twoFactorTempSecret) {
      return res.status(400).json({
        status: 'fail',
        message: 'No 2FA setup in progress'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid verification code'
      });
    }

    // Generate backup codes
    const backupCodes = user.generateBackupCodes();
    
    // Enable 2FA
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = undefined;
    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: '2FA enabled successfully',
      data: {
        backupCodes: backupCodes.map(bc => bc.code)
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.disableTwoFactor = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        status: 'fail',
        message: '2FA is not enabled'
      });
    }

    // Try backup code first
    let verified = user.verifyBackupCode(code);
    
    // If not a backup code, try TOTP code
    if (!verified) {
      verified = user.verifyTwoFactorCode(code);
    }

    if (!verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid verification code'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: '2FA disabled successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 