import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    mobileNumber: {
        type: Number,
        required: true,
        unique: true
    },
    mobileVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        otp: {
            type: Number,
        },
        expiry: {
            type: Date,
        },
        send_cont:{
          type:Number,
        },
        send_limit_time:{
          type:Date,
        }
    },
    email: {
        type: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    PAN: {
        type: String,
        default: null
    },
    panDetails: {
        type: Object,
        default: null
    },
    panConfirmed: {
        type: Boolean,
        default: false
    },
    panVerificationDetails: {
        verifiedAt: { type: Date, default: Date.now },
        status: { type: String, default: 'Pending' },
        details: { type: Object, default: null }
    },
    panApiCallCount: {
        type: Number,
        default: 0
    },
    lastPanApiCallTime: {
        type: Date,
        default: null
    },
    max_step_completed:{
      type:String
    },
    lsid: {
        type: String,
        unique: true
    },
    emailOtp: {
        otp: Number,
        expiry: Date,
        send_cont: Number,
        send_limit_time: Date
    }
});

const User = mongoose.model('User', userSchema);

export default User;