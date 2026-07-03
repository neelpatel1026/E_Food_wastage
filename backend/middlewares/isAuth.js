import jwt from "jsonwebtoken"
const isAuth=async (req,res,next) => {
    try {
        const token=req.cookies.token;
        console.log(`[isAuth] Incoming Request: ${req.method} ${req.originalUrl}`);
        console.log(`[isAuth] Token found: ${token ? "Yes" : "No"}`);
        if(!token){
            console.log("[isAuth] Token not found in cookies");
            return res.status(401).json({message:"Access denied. No token provided."})
        }
        const decodeToken=jwt.verify(token,process.env.JWT_SECRET)
        if(!decodeToken){
            console.log("[isAuth] Token decode failed");
            return res.status(401).json({message:"Access denied. Invalid token."})
        }
        console.log(`[isAuth] Token decoded successfully. userId: ${decodeToken.userId}`);
        req.userId=decodeToken.userId
        next()
    } catch (error) {
         console.error(`[isAuth] Error verifying token: ${error.message}`);
         return res.status(401).json({message:"Access denied. Invalid token."})
    }
}

export default isAuth

