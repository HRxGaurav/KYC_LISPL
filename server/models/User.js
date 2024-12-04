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
    max_step_completed:{
      type:String
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