import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynHandler.js";
import jwt from 'jsonwebtoken';

const verifyJwt = asyncHandler(async (req, res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken')
        req.user = user
        if(!user){
            new ApiError(401,"invalid access token")
        }
    
        next()
    } catch (error) {
        throw new ApiError(401,error.message || "invalide acces token")
    }
})

export {verifyJwt}