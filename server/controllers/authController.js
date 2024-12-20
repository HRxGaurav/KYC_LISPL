import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Function to generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
};

// Function to send OTP
const sendMobileOTP = async (req, res) => {
    const { mobileNumber } = req.body;
    
    try {
        let user = await User.findOne({ mobileNumber });

        if (user && user.PAN) {
            return res.status(400).json({ message: 'User already exists. Please log in.' });
        }

        // Check for existing user and send limit
        if (user && user.otp.send_limit_time) {
            const timeDiff = Date.now() - new Date(user.otp.send_limit_time).getTime();
            const thirtyMinutesInMillis = 30 * 60 * 1000; // 30 minutes in milliseconds
            
            if (timeDiff < thirtyMinutesInMillis) {
                const remainingMinutes = Math.ceil((thirtyMinutesInMillis - timeDiff) / (60 * 1000));
                return res.status(429).json({ 
                    message: `Maximum OTP limit reached. Please try after ${remainingMinutes} minutes.`
                });
            } else {
                // Reset counter and remove limit time if 30 minutes has passed
                user.otp.send_cont = 0;
                user.otp.send_limit_time = null;
            }
        }

        const otp = 550055;
        console.log(otp);

        if (!user) {
            // Find the last user to determine the next LSID
            const lastUser = await User.findOne({}, {}, { sort: { 'lsid': -1 } });
            let nextLSID = 'ls1';
            
            if (lastUser && lastUser.lsid) {
                const lastLSIDNumber = parseInt(lastUser.lsid.replace('ls', ''), 10);
                nextLSID = `ls${lastLSIDNumber + 1}`;
            }

            // Create new user with initial counter and LSID
            user = new User({
                mobileNumber,
                lsid: nextLSID,
                otp: {
                    otp,
                    expiry: Date.now() + 300000, // 5 minutes
                    send_cont: 1 // Initialize counter
                }
            });
        } else {
            // Update existing user and increment counter
            user.otp.otp = otp;
            user.otp.expiry = Date.now() + 300000;
            user.otp.send_cont = (user.otp.send_cont || 0) + 1;

            // Check if limit reached
            if (user.otp.send_cont >= 5) {
                user.otp.send_limit_time = new Date();
                await user.save();
                return res.status(429).json({ 
                    message: 'Maximum OTP limit reached. Please try after 30 minutes.'
                });
            }
        }

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { mobileNumber: user.mobileNumber }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: 'OTP sent successfully', 
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error });
    }
};

// Function to resend OTP
const resendMobileOTP = async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token and extract mobile number
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const mobileNumber = decoded.mobileNumber;

        // Find user with the mobile number
        const user = await User.findOne({ mobileNumber });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if send limit time exists and hasn't expired
        if (user.otp.send_limit_time) {
            const timeDiff = Date.now() - new Date(user.otp.send_limit_time).getTime();
            const fiveMinutesInMillis = 5 * 60 * 1000; // 5 minutes in milliseconds
            
            if (timeDiff < fiveMinutesInMillis) {
                const remainingMinutes = Math.ceil((fiveMinutesInMillis - timeDiff) / (60 * 1000));
                return res.status(429).json({ 
                    message: `Maximum OTP limit reached. Please try after ${remainingMinutes} minutes.`
                });
            } else {
                // Reset counter and remove limit time if 30 minutes has passed
                user.otp.send_cont = 0;
                user.otp.send_limit_time = null;
            }
        }

        // Check and update send counter
        if (!user.otp.send_cont) {
            user.otp.send_cont = 0;
        }

        // Increment counter
        user.otp.send_cont += 1;

        // Check if limit reached
        if (user.otp.send_cont >= 5) {
            user.otp.send_limit_time = new Date();
            await user.save();
            return res.status(429).json({ 
                message: 'Maximum OTP limit reached. Please try after 30 minutes.'
            });
        }

        // Generate new OTP
        // const otp = generateOTP();
        const otp = 550055; // Using static OTP for development

        // Update OTP in database
        user.otp.otp = otp;
        user.otp.expiry = Date.now() + 300000; // 5 minutes expiry
        await user.save();

        // Generate new JWT token
        const newToken = jwt.sign({ mobileNumber }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        // Here you would implement actual OTP sending logic
        console.log(otp);

        res.status(200).json({ 
            message: 'OTP resent successfully', 
            token: newToken,
            remainingAttempts: 5 - user.otp.send_cont
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired' });
        }
        res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
};

const verifyMobileOTP = async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        const { otp } = req.body;
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token and extract mobile number
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const mobileNumber = decoded.mobileNumber;

        // Find user with the mobile number
        const user = await User.findOne({ mobileNumber });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is expired
        if (Date.now() > user.otp.expiry) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Verify OTP
        if (user.otp.otp !== parseInt(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark mobile as verified
        user.mobileVerified = true;

        // Clear OTP after successful verification
        user.otp.otp = null;
        user.otp.expiry = null;
        user.otp.send_cont = 0;
        user.otp.send_limit_time = null;
        await user.save();

        res.status(200).json({
            message: 'OTP verified successfully',
            max_step_completed: user.max_step_completed || 0
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired' });
        }
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
};

const sendEmailOTP = async (req, res) => {
    const { email } = req.body;
    
    try {
        // Get token from header and extract mobile number
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token and extract mobile number
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const mobileNumber = decoded.mobileNumber;

        // Find user with mobile number
        let user = await User.findOne({ mobileNumber });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if send limit time exists and hasn't expired
        if (user.emailOtp?.send_limit_time) {
            const timeDiff = Date.now() - new Date(user.emailOtp.send_limit_time).getTime();
            const fiveMinutesInMillis = 5 * 60 * 1000;
            
            if (timeDiff < fiveMinutesInMillis) {
                const remainingMinutes = Math.ceil((fiveMinutesInMillis - timeDiff) / (60 * 1000));
                return res.status(429).json({ 
                    message: `Maximum OTP limit reached. Please try after ${remainingMinutes} minutes.`
                });
            } else {
                // Reset counter and remove limit time if 30 minutes has passed
                user.emailOtp.send_cont = 0;
                user.emailOtp.send_limit_time = null;
            }
        }

        const otp = 550055; // For development
        console.log('Email OTP:', otp);

        // Set email and OTP details BEFORE saving
        user.email = email;
        user.emailOtp = {
            otp,
            expiry: Date.now() + 300000, // 5 minutes
            send_cont: (user.emailOtp?.send_cont || 0) + 1
        };

        // Check OTP limit
        if (user.emailOtp.send_cont >= 5) {
            user.emailOtp.send_limit_time = new Date();
            await user.save();
            return res.status(429).json({ 
                message: 'Maximum OTP limit reached. Please try after 30 minutes.'
            });
        }

        // Save the user data AFTER setting all fields
        await user.save();

        // Send success response immediately
        res.status(200).json({ 
            message: 'Email OTP sent successfully',
            remainingAttempts: 5 - user.emailOtp.send_cont
        });

        // Handle email sending in the background
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,        // e.g., 'smtp.yourdomain.com'
            port: process.env.SMTP_PORT,        // e.g., 587 or 465
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,    // your email address
                pass: process.env.SMTP_PASS     // your email password
            },
            tls: {
                rejectUnauthorized: false       // useful in development
            }
        });

        // Email content with professional formatting
        const mailOptions = {
            from: {
                name: 'Lakshmi Shree',
                address: process.env.SMTP_USER
            },
            to: email,
            subject: 'OTP Verification - Lakshmi Shree',
            text: `Your OTP for Lakshmi Shree account verification is: ${otp}. This OTP will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${process.env.BACKEND_SERVER}/assets/icons/fullLogo.png"
                             alt="Lakshmi Shree" 
                             style="max-width: 250px; height: auto; margin-bottom: 20px;"
                        />
                        <h2 style="color: #333;">Verify Your Email</h2>
                    </div>
                    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin-bottom: 20px;">Please use the following OTP to verify your email address:</p>
                        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px;">
                            <h1 style="color: #f05156; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                        </div>
                        <p style="margin-top: 20px; color: #666;">This OTP will expire in 5 minutes.</p>
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} Lakshmi Shree. All rights reserved.</p>
                    </div>
                </div>
            `,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            },
            priority: 'high'
        };

        // Send email in background
        transporter.sendMail(mailOptions).catch(error => {
            console.error('Background email sending failed:', error);
            // You might want to implement a retry mechanism or notification system here
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired' });
        }
        console.error('Email OTP Error:', error);
        res.status(500).json({ message: 'Error sending email OTP', error: error.message });
    }
};

const resendEmailOTP = async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token and extract mobile number
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const mobileNumber = decoded.mobileNumber;

        // Find user
        const user = await User.findOne({ mobileNumber });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email exists in database
        if (!user.email) {
            return res.status(400).json({ message: 'No email found for this user' });
        }

        // Check if send limit time exists and hasn't expired
        if (user.emailOtp?.send_limit_time) {
            const timeDiff = Date.now() - new Date(user.emailOtp.send_limit_time).getTime();
            const fiveMinutesInMillis = 5 * 60 * 1000;
            
            if (timeDiff < fiveMinutesInMillis) {
                const remainingMinutes = Math.ceil((fiveMinutesInMillis - timeDiff) / (60 * 1000));
                return res.status(429).json({ 
                    message: `Maximum OTP limit reached. Please try after ${remainingMinutes} minutes.`
                });
            } else {
                // Reset counter if 30 minutes passed
                user.emailOtp.send_cont = 0;
                user.emailOtp.send_limit_time = null;
            }
        }

        const otp = 550055; // For development
        console.log('Email OTP:', otp);

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: {
                name: 'Lakshmi Shree',
                address: process.env.SMTP_USER
            },
            to: user.email, // Using email from database instead of request body
            subject: 'OTP Verification - Lakshmi Shree',
            text: `Your OTP for Lakshmi Shree account verification is: ${otp}. This OTP will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${process.env.BACKEND_SERVER}/assets/icons/fullLogo.png"
                             alt="Lakshmi Shree" 
                             style="max-width: 250px; height: auto; margin-bottom: 20px;"
                        />
                        <h2 style="color: #333;">Verify Your Email</h2>
                    </div>
                    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin-bottom: 20px;">Please use the following OTP to verify your email address:</p>
                        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px;">
                            <h1 style="color: #f05156; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                        </div>
                        <p style="margin-top: 20px; color: #666;">This OTP will expire in 5 minutes.</p>
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} Lakshmi Shree. All rights reserved.</p>
                    </div>
                </div>
            `,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            },
            priority: 'high'
        };

        // Update user's email OTP information
        user.emailOtp = {
            ...user.emailOtp,
            otp,
            expiry: Date.now() + 300000, // 5 minutes
            send_cont: (user.emailOtp?.send_cont || 0) + 1
        };

        // Check if limit reached
        if (user.emailOtp.send_cont >= 5  && false) {
            user.emailOtp.send_limit_time = new Date();
            await user.save();
            return res.status(429).json({ 
                message: 'Maximum OTP limit reached. Please try after 30 minutes.'
            });
        }

        // Send email and save user
        await transporter.sendMail(mailOptions);
        await user.save();

        res.status(200).json({ 
            message: 'Email OTP resent successfully',
            remainingAttempts: 5 - user.emailOtp.send_cont
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired' });
        }
        console.error('Email OTP Error:', error);
        res.status(500).json({ message: 'Error resending email OTP', error: error.message });
    }
};

const verifyEmailOTP = async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        const { email, otp } = req.body;
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token and extract mobile number
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const mobileNumber = decoded.mobileNumber;

        // Find user with the mobile number
        const user = await User.findOne({ mobileNumber });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is expired
        if (Date.now() > user.emailOtp.expiry) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Verify OTP
        if (user.emailOtp.otp !== parseInt(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark email as verified
        user.emailVerified = true;

        //Update step
        user.max_step_completed = 1;

        // Clear email OTP data after successful verification
        user.emailOtp = {
            otp: null,
            expiry: null,
            send_cont: 0,
            send_limit_time: null
        };

        await user.save();

        // Generate new JWT token with 24 hours validity
        const newToken = jwt.sign(
            { mobileNumber: user.mobileNumber }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Email verified successfully',
            token: newToken,
            max_step_completed: user.max_step_completed || 1
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired' });
        }
        res.status(500).json({ message: 'Error verifying email OTP', error: error.message });
    }
};

export { sendMobileOTP,  resendMobileOTP,  verifyMobileOTP, sendEmailOTP,  resendEmailOTP, verifyEmailOTP  };