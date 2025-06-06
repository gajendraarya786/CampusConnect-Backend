export const verifyAccessToken = async (req, res, next) => {
  try {
    // Your JWT verification logic here
    // Example (using accessToken from cookies or header):
    const token = req.cookies?.accessToken || req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    // TODO: verify token with jwt.verify, etc.
    
    next(); // call next if verified
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
