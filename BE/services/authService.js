import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export const registerUser = async (userData) => {
  try {
    const { email, password, name, role = 'customer' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      isApproved: role === 'customer' || role === 'admin',
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET
    );

    return { user, token };
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    if (user.isBanned) {
      throw new Error('Account is banned');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET
    );

    return { user, token };
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const createOrGetGuestUser = async (guestInfo) => {
  try {
    const { fullName, email, phone } = guestInfo;

    if (!fullName || !email || !phone) {
      throw new Error('Full name, email, and phone are required');
    }

    // Check if user with this email already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create a new guest user without password
      user = new User({
        name: fullName,
        email: email.toLowerCase(),
        phone: phone,
        password: undefined, // No password for guest users
        role: 'customer',
        isApproved: true,
      });
      await user.save();
    } else {
      // Update existing user's info if needed
      if (!user.name || user.name === '') {
        user.name = fullName;
      }
      if (!user.phone || user.phone === '') {
        user.phone = phone;
      }
      await user.save();
    }

    // Generate token for guest user
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET
    );

    return { user, token };
  } catch (error) {
    throw error;
  }
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset OTP
export const requestPasswordResetOTP = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal if user exists for security reasons
      // Return success message even if user doesn't exist
      return {
        message: 'If an account exists with this email, an OTP has been sent.',
      };
    }

    // Check if user has a password (not a guest user)
    if (!user.password) {
      throw new Error(
        'This account does not have a password. Please contact support.'
      );
    }

    // Invalidate any existing unused OTPs for this email
    await OTP.updateMany(
      { email: normalizedEmail, isUsed: false },
      { isUsed: true }
    );

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to database
    const otpRecord = new OTP({
      email: normalizedEmail,
      otp,
      expiresAt,
      isUsed: false,
    });
    await otpRecord.save();

    // Send OTP via email
    await sendOTPEmail(normalizedEmail, otp, user.name);

    return {
      message: 'If an account exists with this email, an OTP has been sent.',
    };
  } catch (error) {
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Find valid OTP (not used and not expired - expiresAt must be greater than current time)
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }, // OTP expires after 10 minutes from creation
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as used
    otpRecord.isUsed = false;
    await otpRecord.save();

    return { verified: true, message: 'OTP verified successfully' };
  } catch (error) {
    throw error;
  }
};

// Reset password after OTP verification
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP first (this will check expiration - OTP must be used within 10 minutes)
    await verifyOTP(normalizedEmail, otp);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('User not found');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all OTPs for this email
    await OTP.updateMany({ email: normalizedEmail }, { isUsed: true });

    return { message: 'Password reset successfully' };
  } catch (error) {
    throw error;
  }
};
