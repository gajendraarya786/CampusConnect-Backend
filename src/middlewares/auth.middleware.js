import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js'; // Assuming your User model path
import { ApiError } from '../utils/ApiError.js'; // Assuming you have ApiError utility

export const verifyAccessToken = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken; // Try to get token from cookies first

    // If not in cookies, check Authorization header
    if (!token && req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    }

    if (!token) {
      throw new ApiError(401, 'Unauthorized request: Token not found');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify token

    const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    req.user = user; // Attach user to req object
    next();
  } catch (error) {
    // Differentiate between token expiry and other issues
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired', isExpired: true });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    // For custom ApiError or other unexpected errors
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}; 