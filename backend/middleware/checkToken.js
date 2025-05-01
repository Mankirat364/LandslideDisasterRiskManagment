import jwt from 'jsonwebtoken'

export const checkToken = (req,res,next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.status(400).json({
            message : "Authentication token is missing"
        })
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next()
    } catch (error) {
        return res.status(400).json({
            message : "Invalid or expired token" + error
        })
    }
}