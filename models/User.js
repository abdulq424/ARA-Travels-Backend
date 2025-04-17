const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorTempSecret: {
    type: String,
    select: false
  },
  twoFactorBackupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    }
  }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorCode: String,
  twoFactorCodeExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

// Method to generate 2FA secret
userSchema.methods.generateTwoFactorSecret = function() {
  const secret = speakeasy.generateSecret({
    name: `AQ Travels:${this.email}`
  });
  this.twoFactorTempSecret = secret.base32;
  return secret;
};

// Method to verify 2FA code
userSchema.methods.verifyTwoFactorCode = function(code) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  });
};

// Method to generate backup codes
userSchema.methods.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push({
      code: crypto.randomBytes(4).toString('hex'),
      used: false
    });
  }
  this.twoFactorBackupCodes = codes;
  return codes;
};

// Method to verify backup code
userSchema.methods.verifyBackupCode = function(code) {
  const backupCode = this.twoFactorBackupCodes.find(
    bc => bc.code === code && !bc.used
  );
  
  if (backupCode) {
    backupCode.used = true;
    return true;
  }
  
  return false;
};

// Method to generate email 2FA code
userSchema.methods.generateEmailTwoFactorCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.twoFactorCode = code;
  this.twoFactorCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Method to verify email 2FA code
userSchema.methods.verifyEmailTwoFactorCode = function(code) {
  if (!this.twoFactorCode || !this.twoFactorCodeExpires) {
    return false;
  }

  const isValid = this.twoFactorCode === code && 
                  this.twoFactorCodeExpires > Date.now();

  // Clear the code after verification attempt
  this.twoFactorCode = undefined;
  this.twoFactorCodeExpires = undefined;

  return isValid;
};

const User = mongoose.model('User', userSchema);
module.exports = User; 