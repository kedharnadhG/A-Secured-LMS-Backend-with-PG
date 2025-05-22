import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxLength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"] // regex for email validation
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password should be at least 8 characters"],
        select: false // password will not be returned in the response (unless explicitly asked for)
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'admin', 'instructor'],
            message: "please select a valid role"
        },
        default: "student"
    },
    avatar: {
        type: String,
        default: "default-avatar.png"
    },
    bio: {
        type: String,
        maxLength: [200, "Bio cannot exceed 200 characters"]
    },
    enrolledCourses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        enrolledAt:{
            type: Date,
            default: Date.now
        }
    }],
    createdCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastActive: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

//pre-hook for hashing password, (runs before save)
//(runs only if password is modified & not created)
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcryptjs.hash(this.password, 12);
    next();
})

//compare password (creating method)
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
}


//Reset Password Token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;    

    // "resetToken" is the token that will be sent to the user, because by this token the user will be able to reset their password( how we compare i.e we get the token from the user and we compare it with the token that we have in the database)
}

userSchema.methods.updateLastActive = function() {
    this.lastActive = Date.now();
    return this.lastActive({validateBeforeSave: false});
}


//Virtuals (dynamically computed fields on schema)
userSchema.virtual("totalEnrolledCourses").get(function() {
    return this.enrolledCourses.length;
})

export const User = mongoose.model("User", userSchema);