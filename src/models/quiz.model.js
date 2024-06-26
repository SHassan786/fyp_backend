const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    //this is name
    title: {
        type: String,
        required: true,
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        },
    ],
    // Quiz released at this time
    start_time: {
        type: Date,
        required: true,
    },
    // is time quiz khatam hogya
    end_time: {
        type: Date,
        required: true,
    },
    // this is for status
    is_active: {
        type: Boolean,
        default: false
    },
    is_relesead: {
        type: Boolean,
        default: false
    },
    //Adding Course reference because i need to tell next quiz is of which course
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
    },
    submitted_by: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],
});

const Quiz = mongoose.model("Quiz", quizSchema, "Quizzes");

module.exports = Quiz;
