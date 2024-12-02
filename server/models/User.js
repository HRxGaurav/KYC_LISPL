import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    mobileNumber: {
        type: Number,
        required: true,
        unique: true
    },
    otp: {
        otp: {
            type: Number,
        },
        expiry: {
            type: Date,
        }
    },
});

const User = mongoose.model('User', userSchema);

export default User;