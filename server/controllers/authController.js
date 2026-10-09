import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'oda_roba_hospital_secret_key_2026_super_secure', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  const user = await User.findOne({ username: username.toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    if (!user.active) {
      return res.status(403).json({ message: 'Account is deactivated. Contact hospital administration.' });
    }

    await logAuditEvent({
      req: { ...req, user },
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `Staff member ${user.name} logged in with role ${user.role}`,
    });

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    List hospital staff
// @route   GET /api/auth/staff
// @access  Private (Admin / Director)
export const getStaffList = async (req, res) => {
  const staff = await User.find({}).select('-password').sort({ role: 1, name: 1 });
  res.json(staff);
};
