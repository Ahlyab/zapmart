import * as authService from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateUserProfile(req.user._id, req.body);
    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createGuestAccount = async (req, res) => {
  try {
    const { guestInfo } = req.body;
    
    if (!guestInfo || !guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
      return res.status(400).json({ message: 'Guest information is required' });
    }
    
    const { user, token } = await authService.createOrGetGuestUser(guestInfo);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};