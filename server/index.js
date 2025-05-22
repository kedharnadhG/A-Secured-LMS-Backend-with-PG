import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


//Global rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again after 15 minutes"
})

//Security Middlewares
app.use(helmet());  //"helmet" is a security middleware that protects against well-known web vulnerabilities like Cross-Site Scripting (XSS), by setting various HTTP headers
app.use(mongoSanitize()); //prevents NoSQL injection 
app.use(hpp());  //prevents HTTP parameter pollution (means passing same parameter multiple times in the url)
app.use("/api", limiter); //apply to the requests that start with /api
app.use(cookieParser());  //parse cookies for authentication and authorization (like jwt, we get the token from the cookie)

//dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Body parser middleware (data will be available in req.body)
app.use(express.json({limit: '10kb'}));     //accept json with max size of 10kb
app.use(express.urlencoded({extended: true, limit: '10kb'}));            //sometimes we get data from urlencoded form (means form data or query params) (extended: true means that we can get data from nested objects )


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    })
})


//CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Access-Control-Allow-Origin",
        "device-remember-token",
        "Origin"
    ]
}))



 

// API Routes










//it should always be at the bottom
// 404 handler
app.use((req, res)=>{
    res.status(404).json({
        status: "error",
        message: 'Not Found'
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
})
