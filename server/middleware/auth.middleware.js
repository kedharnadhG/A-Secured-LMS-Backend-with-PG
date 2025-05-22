import jwt from "jsonwebtoken";
import { ApiError, catchAsync } from "./error.middleware";



//job of this middleware is to execute the functionality before we hit the controller
export const isAuthenticated = catchAsync(async (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        throw new ApiError("You are not logged in", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.userId;
        next();        
    } catch (error) {
        throw new ApiError("JWT Token error", 401);
    }
})