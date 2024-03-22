const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    course_name: {
        type: String,
        required: true,
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],
    description: {
        type: String,
        required: true,
        default: "",
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    quizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
        },
    ],
    avg_rating: {
        type: mongoose.Decimal128,
        required: false,
        default: 0,
    },
    join_code: {
        type: Number,
        required: true,
    },
    // Two new variables added, they will be updated whenever quiz will be added i guess this is my logic - Shehryar
    quizCreated: {
        type: Number,
        required: true,
    },
    quizReleased: {
        type: Number,
        required: true,
    },
    studentEnrolledCount: {
        type: Number,
        required: true,
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    },
});

const Class = mongoose.model("Class", classSchema, "Classes");

module.exports = Class;
