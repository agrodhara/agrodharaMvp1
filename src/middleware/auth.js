const jwt = require('jsonwebtoken');
const { db } = require('../config');

const authenticateToken = async (req, res, next) => {
  try {
    console.log("Authentication check started");
    const authHeader = req.headers["authorization"];
    console.log("Auth header:", authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "Access token required" });
    }

    try {
      // Verify token signature
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("Token decoded successfully:", { phone: decoded.phone });
      
      // Check if token exists in database and hasn't expired
      console.log("Checking token in database...");
      const [rows] = await db.pool.execute(
        'SELECT * FROM auth_tokens WHERE phone = ? AND auth_token = ? AND expires_at > NOW()',
        [decoded.phone, token]
      );

      console.log("Token database check result:", rows.length > 0 ? "Valid" : "Invalid");
      if (rows.length === 0) {
        console.log("Token not found in database or expired");
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      req.user = { phone: decoded.phone };
      console.log("Authentication successful, proceeding to next middleware");
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(403).json({ error: "Invalid token format or signature" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

const authenticateFarmerToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers["authorization"];
    console.log("Raw auth header:", authHeader);
    
    // Handle different token formats
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(" ")[1];
    } else if (authHeader) {
      // If "Bearer " prefix is missing, use the whole header
      token = authHeader;
    }
    
    console.log("Extracted token:", token ? token.substring(0, 15) + "..." : "none");
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Access token is required" });
    }

    try {
      // Look up token in database
      console.log("Looking up token in database...");
      const [rows] = await db.pool.execute(
        'SELECT * FROM farmer_sessions WHERE access_token = ?',
        [token]
      );
      
      console.log(`Token lookup result: ${rows.length} rows found`);
      
      if (rows.length === 0) {
        console.error("Invalid or expired farmer token - not found in database");
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
      }
      
      // Check if token has expired
      const now = new Date();
      const expiresAt = new Date(rows[0].expires_at);
      
      if (expiresAt < now) {
        console.error(`Token expired at ${expiresAt.toISOString()}, current time is ${now.toISOString()}`);
        return res.status(403).json({ success: false, message: "Token has expired" });
      }
      
      console.log("Farmer token verified successfully for farmer ID:", rows[0].farmer_id);
      
      // Set the farmer ID in the request object
      req.farmer = { farmerId: rows[0].farmer_id };
      next();
    } catch (error) {
      console.error("Farmer token verification error:", error);
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Farmer authentication error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during authentication" });
  }
};

module.exports = {
  authenticateToken,
  authenticateFarmerToken
};