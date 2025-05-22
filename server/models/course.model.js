import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Course Title is required"],
        trim: true,
        maxLength: [100, "Course Title cannot exceed 100 characters"]
    },
    subtitle: {
        type: String,
        trim: true,
        maxLength: [200, "Course Title cannot exceed 200 characters"]
    },
    description: {
        type: String,
        trim: true 
    },
    category: {
        type: String,
        required: [true, "Course Category is required"],
        trim: true,
    },
    level: {
        type: String,
        enum:{
            values: ['beginner', 'intermediate', 'advanced'],
            message: "Please select a valid course level"
        },
        default: 'beginner'
    },
    price: {
        type: Number,
        required: [true, "Course Price is required"],
        min: [0, "Course Price cannot be negative"]
    },
    thumbnail: {
        type: String,
        trim: [true, "Course thumbnail is required"]
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    lectures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture"
        }
    ],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Course Instructor is required"]
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    totalDuration: {
        type: Number,
        default: 0
    },
    totalLectures: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});


courseSchema.virtual("averageRating").get(function() {
    return 0; //TODO: placeholder assignment
})

courseSchema.pre("save", function(next){
    if(this.lectures){
        this.totalLectures = this.lectures.length;
    }

    next();
})


export const Course = mongoose.model("Course", courseSchema);