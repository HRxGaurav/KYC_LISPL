import fetch from "node-fetch";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";

// Encryption Configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (256-bit key)
const IV_LENGTH = 16; // AES requires a 16-byte IV


// Function to encrypt data
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`; // Store IV with the encrypted data
  };
  
  // Function to decrypt data
  const decrypt = (encryptedText) => {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  

const checkPAN = async (req, res) => {
  try {
    // Extract PAN number from request body
    const { panNumber } = req.body;
    

    // Extract JWT token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (tokenError) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Find user by mobile number from decoded token
    const user = await User.findOne({ mobileNumber: decoded.mobileNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if PAN is already confirmed
    if (user.panConfirmed) {
      return res.status(400).json({ message: "PAN already verified" });
    }

    // Validate PAN number format (basic regex check)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      return res.status(400).json({ message: "Invalid PAN number format" });
    }

    // Check PAN verification attempts and cooldown logic
    const currentTime = new Date();
    const cooldownPeriod = 30 * 60 * 1000; // 30 minutes in milliseconds
    const fiveMinutePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
    const nineAttemptsLimit = 9;

    if (user.lastPanApiCallTime && false) {
        const timeSinceLastCall = currentTime - new Date(user.lastPanApiCallTime);
        if (timeSinceLastCall < cooldownPeriod && user.panApiCallCount == nineAttemptsLimit) {
            const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastCall) / 1000 / 60);
            return res.status(429).json({ message: `You have exceeded the maximum attempts allowed within 30 minutes. Please try again in ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.` });
        }
        if (timeSinceLastCall < fiveMinutePeriod) {
            if (user.panApiCallCount == 3) {
                const remainingTime = Math.ceil((fiveMinutePeriod - timeSinceLastCall) / 1000 / 60);
                return res.status(429).json({ message: `You have exceeded the maximum attempts allowed within 5 minutes. Please try again in ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.` });
            }
        }
        // Check for spam protection limit
        if (user.panApiCallCount >= nineAttemptsLimit) {
            return res.status(429).json({ message: `You have exceeded the maximum attempts allowed.` });
        }
        // Increment the count if within limits
        user.panApiCallCount += 1;
        user.lastPanApiCallTime = currentTime;
        await user.save();
    } else {
        user.panApiCallCount = 1;
        user.lastPanApiCallTime = currentTime;
        await user.save();
    }

    // Proceed with the PAN verification API call
    // Prepare API request
    const apiUrl = process.env.API_LINK + "/api/v3/pan-extensive/premium";
    const requestData = {
      panNumber: panNumber,
      getStatusInfo: true,
    };

    // Make API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: process.env.ACCESS_TOKEN_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // Check API response
    if (response.ok) {
      // Parse API response
      const panVerificationData = await response.json();

      // Update user with PAN details
      user.panDetails = panVerificationData.result;
      await user.save();

      // Return successful response
      res.status(200).json({
        message: "PAN verified successfully",
        panDetails: panVerificationData,
      });
    } else {
      const errorData = await response.json();
      switch (response.status) {
        case 200:
          return res.status(200).json({ message: "PAN verification successful", panDetails: errorData });
        case 400:
          user.panApiCallCount += 1;
          user.lastPanApiCallTime = currentTime;
          await user.save();
          return res.status(400).json({ message: errorData.message || "Invalid PAN number" });
        case 401:
          return res.status(401).json({ message: errorData.message || "Unauthorized: Invalid token or API key" });
        case 404:
          user.panApiCallCount += 1;
          user.lastPanApiCallTime = currentTime;
          await user.save();
          return res.status(404).json({ message: errorData.message || "PAN Number not found" });
        case 409:
          return res.status(409).json({ message: "Upstream error: " + (errorData.message || "Error from upstream") });
        default:
          return res.status(response.status).json({ message: "PAN verification failed", error: errorData });
      }
    }
  } catch (error) {
    console.error("PAN Verification Error:", error);
    res.status(500).json({
      message: "Internal server error during PAN verification",
      error: error.message,
    });
  }
};

const confirmPAN = async (req, res) => {
    try {
        // Extract JWT token from Authorization header
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (tokenError) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        // Find user by mobile number from decoded token
        const user = await User.findOne({ mobileNumber: decoded.mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user details
        user.panConfirmed = true;
        user.PAN = user.panDetails.number;
        user.panVerificationDetails = {
            verifiedAt: new Date(),
            status: 'Success',
            details: null
        };
        await user.save();

        // Return successful response
        res.status(200).json({ message: "PAN confirmed successfully" });
    } catch (error) {
        console.error("PAN Confirmation Error:", error);
        res.status(500).json({
            message: "Internal server error during PAN confirmation",
            error: error.message,
        });
    }
};

export { checkPAN, confirmPAN };
