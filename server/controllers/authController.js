import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Function to generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
};

// Function to send OTP
const sendMobileOTP = async (req, res) => {
    const { mobileNumber } = req.body;
    
    

    try {
        let user = await User.findOne({ mobileNumber });

        // const otp = generateOTP();
        const otp=550055;
        console.log(otp);

        if (!user) {
            // If user does not exist, create a new user
            user = new User({
                mobileNumber,
                otp: {
                    otp,
                    expiry: Date.now() + 300000 // OTP valid for 5 minutes (300000 ms)
                }
            });
            await user.save();
        } else {
            // If user exists, update the OTP
            user.otp.otp = otp;
            user.otp.expiry = Date.now() + 300000; // OTP valid for 5 minutes (300000 ms)
            await user.save();
        }

        // Generate JWT token using process.env.JWT_SECRET_KEY
        const token = jwt.sign({ mobileNumber: user.mobileNumber }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        // Here you would send the OTP to the user's mobile number
        // For example, using a service like Twilio (not implemented here)

        res.status(200).json({ message: 'OTP sent successfully',  token });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error });
    }
};

export { sendMobileOTP };