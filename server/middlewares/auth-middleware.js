import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config()

const checkAuthUser = async (req, res, next)=>{
    const token = req.header('Authorization');
 

    if(!token){
        res.status(401).json({status:"failed", message: "Unauthorized"});
    }

    try {
        const {userID} =  jwt.verify(token, process.env.JWT_SECRET_KEY);

        //get user from Token
        req.user= userID;        
        next()
        
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

const checkLoggedIn = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ status: "failed", message: "Not logged in" });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY);
        // If the token is valid, send a response indicating the user is logged in
        return res.json({ isLoggedIn: true });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

export { checkAuthUser, checkLoggedIn };