import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
      isApproved: role === 'customer' || role === 'admin'
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