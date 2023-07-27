const userModel = require("../Models/userModel");

const {
  validateUserName,
  validatePassword,
  validateEmailId,
} = require("../Validation/validation");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// const mailGen = require('mailgen');
const randomString = require("randomstring");






const forgotPasswordEmail = async function (userName, emailId, token, res) {
  try {
    let config = {
      host: "smtp.gmail.com",
      port: "587",
      secure: false,
      requireTLS: true,
      auth: {
        user: "sagarmaan210@gmail.com",
        pass: "Maan@28051997", // Use "pass" instead of "password" for Nodemailer
      },
    };
    
  let transporter = nodemailer.createTransport(config);

let message = {
  from: "sagarmaan210@gmail.com",
  to: emailId,
  subject: "Password reset link",
  text: "Click on the following link to reset your password",
  html:
    "<p>Hii " +
    userName +
    ' , follow the link given below and <a href="http://127.0.0.1:3000/resetPassword?' +
    token +
    '">reset your password</a></p>',
};
    const info = await transporter.sendMail(message);
    console.log(`Mail has been sent to ${emailId}.`, info.response);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//================================= Register User ================================================//

const userRegistration = async function (req, res) {
  try {
    let body = req.body;

    let { userName, emailId, password } = body;

    if (Object.keys(body).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Body can't be empty" });

    if (!userName || !userName.trim())
      return res.status(400).send({
        status: false,
        message: "Please provide user name , it can't be empty",
      });

    if (!validateUserName(userName))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid  user name" });

    if (!emailId || !emailId.trim())
      return res.status(400).send({
        status: false,
        message: "Please provide emailId , it can't be empty",
      });

    if (!validateEmailId(emailId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid  emailId" });

    if (!password || !password.trim())
      return res.status(400).send({
        status: false,
        message: "Please provide password , it can't be empty",
      });

    if (!validatePassword(password))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid password" });

    let hashing = bcrypt.hashSync(password, 8);
    body.password = hashing;

    let checkDuplicate = await userModel.find({
      $or: [{ userName: userName }, { emailId: emailId }],
    });

    if (checkDuplicate.userName === userName) {
      return res.status(400).send({
        status: false,
        message: "This user name is already registered.",
      });
    } else if (checkDuplicate.emailId === emailId) {
      return res.status(400).send({
        status: false,
        message: "This email ID is already registered.",
      });
    } else {

      let userRegister = await userModel.create(body);

      return res.status(201).send({
        status: true,
        message: "User login successfully.",
        data: userRegister,
      });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const userLogin = async function (req, res) {
  try {
    let body = req.body;

    let { emailId, password } = body;

    if (Object.keys(body).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Body can't be empty" });

    if (!emailId || !emailId.trim())
      return res.status(400).send({
        status: false,
        message: "Please provide emailId , it can't be empty",
      });

    if (!validateEmailId(emailId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid  emailId" });

    if (!password || !password.trim())
      return res.status(400).send({
        status: false,
        message: "Please provide password , it can't be empty",
      });

    if (!validatePassword(password))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid password" });

    let verifyUser = await userModel.findOne({ emailId: emailId });
    if (!verifyUser) {
      return res.status(400).send({ status: false, message: "User not found" });
    }

    let hash = verifyUser.password;

    let isCorrect = bcrypt.compareSync(password, hash);
    if (!isCorrect)
      return res
        .status(400)
        .send({ status: false, message: "Password is incorrect" });

    let payload = { userId: verifyUser["_id"], iat: Date.now() };
    let token = jwt.sign(payload, "Secret-Key", { expiresIn: "1h" });

    res.setHeader("x-api-key", token);
    return res.status(200).send({
      status: true,
      message: "User login successfull",
      data: { userId: verifyUser["_id"], token },
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



const forgotPassword = async function (req, res) {
  try {
    let { emailId } = req.body;

    let checkEmail = await userModel.find({ emailId: emailId });

    if (checkEmail) {
      const resetToken = randomString.generate();
      await userModel.findOneAndUpdate(
        { emailId: emailId },
        { resetToken: resetToken }
      );

      forgotPasswordEmail( emailId , resetToken , res);

      return res
        .status(200)
        .send({
          status: true,
          message: "Reset password link send successfully to your emailId.",
        });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "User not found with this emailId." });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


const resetPassword = async function ( req , res ) {
  try{

  }catch(error){
    return res.status(500).send({ status: false, message: error.message });
  }
}
module.exports = { userRegistration, userLogin, forgotPassword , resetPassword};
