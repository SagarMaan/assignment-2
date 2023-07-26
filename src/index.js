const express = require("express");
const mongoose = require("mongoose");
const route = require("./Routes/route");
const app = express();


app.use(express.json());


mongoose.set("strictQuery", true);
mongoose.connect("mongodb+srv://SagarMaan:yHJBlRWQ0FdJmdj6@chaudhary-shaab-db.cueddss.mongodb.net/Assignment",
    { useNewUrlParser: true }
)
    .then(() => console.log("mongoDB is connected."))
    .catch((err) => console.log(err));

app.use("/", route);

let port = 3000;
app.listen(port, function () {
    console.log(`Express app is running on port ${port}`)});
