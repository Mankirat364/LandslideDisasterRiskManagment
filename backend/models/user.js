import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    fullName : {
        type  : String,
        required : true,
        minLength : 3,
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    isVerfied : {
        type : Boolean,
        default : false
    },
    role  : {
        type : String,
        enum : ['admin','user'],
        required : true,
        default : 'user'
    },
    verificationTokenHash : String,
    verificationTokenExpiry : Date,
    mfaSecret : String,
},
    {timestamps : true}
)

const User = mongoose.model("User", userSchema);
export default User