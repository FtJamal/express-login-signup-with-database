import express from "express"
import cors from "cors"
import mongoose from 'mongoose';

// mongoose.connect('mongodb+srv://abc:abc@cluster0.uhv9f8j.mongodb.net/?retryWrites=true&w=majority');

const app = express();
app.use(express.json());
app.use(cors());


const port = process.env.PORT || 3000;

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },

    age: { type: Number, min: 17, max: 65, default: 18 },
    isMarried: { type: Boolean, default: false },

    createdOn: { type: Date, default: Date.now },
});

const userModel = mongoose.model('User', userSchema);


app.post("/signup", (req, res) => {

    let body = req.body;

    if (!body.firstName
        || !body.lastName
        || !body.email
        || !body.password
    ) {
        res.status(400).send(
            `required fields missing, request example: 
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    // check if user already exist // query email user
    userModel.findOne({ email: body.email }, (err, data) => {
        if (!err) {
            console.log("data:", data);

            if (data) {  // user already exist
                console.log("user already exist: ", data);
                res.status(400).send({ message: "user already exist,please try a different email" });
                return;

            } else {   // user not already exist


                let newUser = new userModel({
                    firstName: body.firstName,
                    lastName: body.lastName,
                    email: body.email.toLowerCase(),
                    password: body.password
                });
                newUser.save((err, result) => {
                    if (!err) {
                        console.log("data saved:", result);
                        res.status(201).send({ message: "user is created" });
                    } else {
                        console.log("db error:", err);
                        res.status(500).send({ message: "internal server error" });
                    }
                });
            }
        } else {
            console.log("db error: ", err);
            res.status(500).send({ message: "db error in query" });
        }
    })
});




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


/////////////////////////////////////////////////////////////////////////////////////////////////
let dbURI = 'mongodb+srv://abc:abc@cluster0.uhv9f8j.mongodb.net/socialMediaDB?retryWrites=true&w=majority';
mongoose.connect(dbURI);

////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////