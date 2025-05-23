import Razorpay from "razorpay";
import crypto from "crypto";
import ApiError from "../utils/ApiError.js";
import { Course } from "../models/course.model.js"
import { CoursePurchase } from "../models/coursePurchase.model.js"


//create instance of razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


//*** IMPORTANT */

export const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.id;
        const {courseId} = req.body; //the more info we get, the better it is

        const course = await Course.findById(courseId);

        if(!course){
            throw new ApiError("Course not found", 404);
        }

        const newPurchase = new CoursePurchase({
            user: userId,
            course: courseId,
            amount: course.price,
            status: "pending",
        });

        //create razorpay options
        const options = {
            amount: course.price * 100, //amount in paisa
            currency: "INR",
            receipt: `course-${courseId}`,
            notes: {
                courseId: courseId,
                userId: userId
            }
            // payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);
    
        //be always security cautious when you are deducting the payment. (re-verifying that no-big-deal)
        //we have to verify / match the amount  (whatever the amount is being deducted & whatever the price of the course)

        newPurchase.paymentId = order.id;
        await newPurchase.save();

        res.status(200).json({
            success: true,
            data: order,
            course: {
                name: course.title,
                description: course.description
            },
        });



    } catch (error) {
        
        console.log("Error creating razorpay order:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


//verify payment signature (after the response from checkout)
export const verifyRazorpayPayment = async (req, res) => {
    try {
       const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

       //verify the signature
       const body = razorpay_order_id + "|" + razorpay_payment_id; 

       const expectedSignature = crypto
       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
       .update(body)
       .digest("hex");

       const isAuthentic = expectedSignature === razorpay_signature;

       if(!isAuthentic){
        throw new ApiError("Payment verification failed", 400);
       }

       const purchase = await CoursePurchase.findOne({paymentId: razorpay_order_id});

       if(!purchase){
        throw new ApiError("Payment record not found", 404);
       }

       purchase.status = "completed";
       await purchase.save();

       res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        courseId: purchase.course
       });


       
    } catch (error) {
        
        console.log("Error verifying razorpay payment:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });        

    }

}