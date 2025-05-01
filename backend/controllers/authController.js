import crypto from 'crypto'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import User from '../models/user.js';


export const createUser = async(req,res)=>{
    const {fullName,email,password,role} = req.body;
    try {
        if(!fullName || !email || !password){
            return res.status(404).json({
                message : "All fields are neccesssary"
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(404).json({
                message : "User already Exist in database"
            })
        }
        const hashedPassword = await argon2.hash(password);
        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
        const newUser = await User.create({
            fullName,
            email,
            role,
            password : hashedPassword,
            verificationTokenHash : tokenHash,
            verificationTokenExpiry : Date.now() + 7 * 24 * 60 * 60 * 1000
        })
   
        const jwtToken = jwt.sign({id: newUser._id},process.env.JWT_SECRET, {expiresIn : "7d"});
        res.cookie('token',jwtToken, {
            httpOnly : true,
            secure : true,
            sameSite: 'Lax',
            maxAge : 7 * 24 * 60 * 60 * 1000
        })
        res.status(201).json({
            message : "Signup Sucessfully done",
            newUser,
            jwtToken,
            verifyToken: token, 
        })
    } catch (error) {
        res.status(500).json({
            message : `Something went wrong : ${error}`
        })
    }
}
export const verifyUser = async(req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user || !user.isVerfied ){
            return res.status(400).json({
                message : "Invalid or unverified account"
            })
        }
        const isMatch = await argon2.verify(user.password, password);
        if(!isMatch){
            return res.status(401).json({
                message : "Invalid Credentials"
            })
        }
        const token = jwt.sign({id : user._id},process.env.JWT_SECRET, {
            expiresIn : "7d"
        })
        res.cookie('token',token, {
            httpOnly : true,
            secure : true,
            sameSite: 'Lax',
            maxAge : 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            message : "User loggin successfull",
            user,
            token
        }) 
    } catch (error) {
        res.status(500).json({
            message : `Something went wrong :${error}`
        })
    }
}
export const verifyAccount = async(req,res)=>{
    const {token} = req.params;
    
    const tokenHash = crypto.createHash("sha256").update(token).digest('hex');
    const user = await User.findOne({
        verificationTokenHash : tokenHash,
        verificationTokenExpiry : {$gt : Date.now()}
    })
    if(!user){
        return res.status(400).json({
            message : "token expire or invalid"
        })
    }
    user.isVerfied = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save()

    res.status(200).json({
        message : "Email verified sucessfully"
    })
}
export const verifyToken = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            verifiedCheck: true,
            message: "User is verified",
            user: req.user
        });
    } catch (error) {
        res.status(400).json({
            verifiedCheck: false,
            success: false,
            message: `User not verified: ${error}`
        });
    }
};
export const updateUser = async(req,res)=>{
    const{password,email,fullName} = req.body;
    try {
        const user = await User.findOne({ email: email });

        if(!user){
            return res.status(404).json({
                message :"User not found"
            })
        }
        if(email) user.email = email;
        if(fullName) user.fullName = fullName;
        if(password){
            const hashedPassword = await argon2.hash(password);
            user.password = hashedPassword;
        }
        await user.save()
        return res.status(201).json({
            message : "User updated successfully"
        })
    } catch (error) {
        console.error("error updating user", error);
        return res.status(500).json({
            message: "Server error"
        })
    }

}
export const logoutRoute = async(req,res) =>{
    try {
        res.clearCookie('token')
        res.status(200).json({
            message : "User logout Sucessfully"
        })
    } catch (error) {
        res.status(500).json({
            message : "Something went wrong" + error
        })
    }
}