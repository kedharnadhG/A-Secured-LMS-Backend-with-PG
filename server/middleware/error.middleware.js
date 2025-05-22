// ############################   Centralized Error Handler   ############################
// custom error handler
export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}



// To avoid writing repetitive try...catch blocks in every route, we use catchAsync
/* 

    It takes a function fn (typically an async controller or middleware).

    Returns a new function with (req, res, next) that runs fn(...).

    If fn(...) throws a promise rejection, it’s caught using .catch(next).

    next(error) will then forward the error to Express’s global error handler.

*/
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}




// handle JWT error
export const handleJWTError = () => {
    new ApiError('Invalid Token. Please login again', 401);
}