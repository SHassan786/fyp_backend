const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const port = process.env.PORT || 5000;

app.use("/uploads", express.static("uploads"));

require("./src/db/conn");

app.use("/teacher", require("./src/routes/teacher.routes"));
app.use("/student", require("./src/routes/student.routes"));
app.use("/class", require("./src/routes/class.routes"));
app.use(require("./src/routes/login.routes"));
app.use("/quiz", require("./src/routes/quiz.routes"));
app.use("/question", require("./src/routes/question.routes"));

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
