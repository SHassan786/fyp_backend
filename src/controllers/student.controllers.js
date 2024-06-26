const Student = require("../models/student.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Class = require("../models/class.model");

const signUp = async (req, res) => {
    try {
        console.log("student/signUp");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name, erp, profile_picture } = req.body;
        const file = profile_picture;

        console.log(req.body);

        const existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json({ msg: "User with this email already exists" });
        }

        const existingErp = await Student.findOne({ erp });
        if (existingErp) {
            return res.status(409).json({ msg: "ERP already exists" });
        }

        console.log("Creating new user");

        const hashedPassword = await bcrypt.hash(password, 10);
        const student = new Student({
            email,
            password: hashedPassword,
            name,
            erp,
            profile_picture: {
                filename: file.filename,
                path: file.path,
            },
        });

        console.log("Saving new user", student);
        await student.save();

        res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const profile = async (req, res) => {
    try {
        console.log("student/profile");

        let student = await Student.findById(req.decoded.id).select(
            "-password"
        );
        if (!student) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({ msg: "Profile", student: student });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log("student/profile");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let updateFields = {};

        // Check if the fields exist in the request body and add them to the updateFields object
        if (req.body.name) updateFields.name = req.body.name;
        if (req.body.erp) updateFields.erp = req.body.erp;
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            updateFields.password = hashedPassword;
        }

        // Check if a file is uploaded and add it to the updateFields object
        if (req.body.profile_picture) {
            updateFields.profile_picture = {
                filename: req.body.profile_picture.filename,
                path: req.body.profile_picture.path,
            };
        }

        let student = await Student.findById(req.decoded.id);
        if (!student) {
            return res.status(404).json({ msg: "User not found" });
        }

        const existingErp = await Student.findOne({
            erp: updateFields.erp,
        });
        if (
            updateFields.erp &&
            existingErp &&
            existingErp._id.toString() !== student._id.toString()
        ) {
            return res
                .status(409)
                .json({ msg: "ERP already exists for different user" });
        }

        console.log("updateFields:", updateFields);
        console.log("student:", student);

        student = await Student.findByIdAndUpdate(student._id, updateFields, {
            new: true,
        }).select("-password");

        console.log("student:", student);

        res.status(200).json({ msg: "Update Profile", student: student });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getPicture = async (req, res) => {
    try {
        console.log("uploads/" + req.params.filename);

        res.sendFile("uploads/" + req.params.filename, {
            root: "../../",
        });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const joinClass = async (req, res) => {
    try {
        console.log("student/joinClass");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const join_code = req.body.class_code;

        // dont select password, email, age
        let student = await Student.findById(req.decoded.id).select(
            "-password -email -age"
        );
        if (!student) {
            return res.status(404).json({ msg: "User not found" });
        }

        const class_ = await Class.findOne({ join_code });
        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        // add student to array of students in class and add class to array of classes in student
        student.classes.push(class_._id);
        await student.save();

        class_.students.push(student._id);
        await class_.save();

        // update studentEnrolledCount in class
        class_.studentEnrolledCount += 1;
        await class_.save();

        res.status(200).json({ msg: "Class joined", student: student });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// leave class
const leaveClass = async (req, res) => {
    try {
        console.log("student/leaveClass/:classId");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // dont select password, email, age
        let student = await Student.findById(req.decoded.id).select(
            "-password -email -age"
        );
        if (!student) {
            return res.status(404).json({ msg: "User not found" });
        }

        const class_ = await Class.findById(req.params.classId);
        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        if (!student.classes.includes(req.params.classId)) {
            return res
                .status(400)
                .json({ msg: "Student not enrolled in class" });
        }

        if (!class_.students.includes(req.decoded.id)) {
            return res.status(400).json({ msg: "Student not in class" });
        }

        // remove class from student classes
        student.classes = student.classes.filter(
            (classId) => classId.toString() !== class_._id.toString()
        );

        // remove student from class students
        class_.students = class_.students.filter(
            (studentId) => studentId.toString() !== student._id.toString()
        );

        await student.save();
        await class_.save();

        // update studentEnrolledCount in class
        class_.studentEnrolledCount -= 1;
        await class_.save();

        res.status(200).json({ msg: "Class left", student: student });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = {
    signUp,
    profile,
    updateProfile,
    getPicture,
    joinClass,
    leaveClass,
};
