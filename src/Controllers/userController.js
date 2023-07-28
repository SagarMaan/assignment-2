const userModel = require("../Models/userModel");

const {
  validateUserName,
  validatePassword,
  validateEmailId,
} = require("../Validation/validation");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomString = require("randomstring");
const otpGenerator = require("otp-generator");



let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: "465",
  secure: true,
  requireTLS: true,
  auth: {
    user: "sagarmaan2015@gmail.com",
    pass: "zsfopkdqzsylkzfu",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for message");
    console.log(success);
  }
});

const forgotPasswordLink = async function (userName, emailId, resetToken) {
  try {
    let message = {
      from: "sagarmaan2015@gmail.com",
      to: emailId,
      subject: "Password reset link",
      text: "Click on the following link to reset your password",
      html:
        "<p> Hii " +
        userName +
        ' , Please follow the link given below and <a href="http://127.0.0.1:3000/resetPassword?token=' +
        resetToken +
        '">reset your password.</a></p>',
    };

    transporter
      .sendMail(message)
      .then(() => {
        return { message: "verification email sent" };
      })
      .catch((error) => {
        return error.message;
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const otpGeneretorLink = async function (userName, emailId, otp) {
  try {
    let message = {
      from: "sagarmaan2015@gmail.com",
      to: emailId,
      subject: "OTP for change password.",
      text: "Click on the following link to reset your password",
      html:
        "<p> Hii " +
        userName +
        ' , Use this OTP and <a href="http://127.0.0.1:3000/changePassword?otp=' +
        otp +
        '">reset your password.</a></p>',
    };

    transporter
      .sendMail(message)
      .then(() => {
        return { message: "verification email sent" };
      })
      .catch((error) => {
        return error.message;
      });
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
    password = hashing;
    emailId = emailId.trim();
    userName = userName.trim();
   
    let checkDuplicate = await userModel.findOne({
      $or: [{ userName: userName },{ emailId: emailId } ],
    });
   

    if(checkDuplicate){
    if (checkDuplicate.userName === userName) {
      return res.status(400).send({
        status: false,
        message: "This user name is already registered.",
      });
    }
    else if (checkDuplicate.emailId === emailId) {
      return res.status(400).send({
        status: false,
        message: "This email ID is already registered.",
      });
    }
    }
  
      let userRegister = await userModel.create({
        userName,
        emailId,
        password,
      });

      return res.status(201).send({
        status: true,      
        message: "User login successfully.",
        data: userRegister,
      });
    
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//================================= User Login ================================================//

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

//================================= Email send for reset password link  =========================================//

const forgotPasswordEmail = async function (req, res) {
  try {
    let { emailId } = req.body;

    let checkEmail = await userModel.findOne({ emailId: emailId.trim() });

    if (checkEmail) {
      const resetToken = randomString.generate();
      await userModel.findOneAndUpdate(
        { emailId: emailId },
        { resetToken: resetToken }
      );

      forgotPasswordLink(checkEmail.userName, checkEmail.emailId, resetToken)
        .then(() => {
          return res.status(200).send({
            status: true,
            message: "Reset password link send successfully to your emailId.",
          });
        })
        .catch((error) => {
          return res.status(200).send({
            status: true,
            message: error.message,
          });
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

//================================= Reset Password via Link  ================================================//

const resetPasswordByLink = async function (req, res) {
  try {
    let token = req.query.token;

    let checkToken = await userModel.findOne({ resetToken: token });

    if (checkToken) {
      let body = req.body;
      let { newPassword } = body;

      if (!newPassword || !newPassword.trim())
        return res.status(400).send({
          status: false,
          message: "Please provide password , it can't be empty",
        });

      if (!validatePassword(newPassword))
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid password" });

      let hashing = bcrypt.hashSync(newPassword, 8);
      newPassword = hashing;

      let updatePassword = await userModel.findOneAndUpdate(
        { _id: checkToken._id },
        { $set: { password: newPassword, resetToken: "" } },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "Password reset successfully.",
        data: updatePassword,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Your token may be invalid or expired.",
      });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//================================ OTP send via Email for reset password  =======================================//

const otpGeneratorEmail = async function (req, res) {
  try {
    let { emailId } = req.body;

    let checkEmail = await userModel.findOne({ emailId: emailId });

    if (checkEmail) {
      let newOTP = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      await userModel.findOneAndUpdate({ emailId: emailId }, { otp: newOTP });

      otpGeneretorLink(checkEmail.userName, checkEmail.emailId, newOTP)
        .then(() => {
          return res.status(200).send({
            status: true,
            message: "OTP send successfully to your emailId.",
          });
        })
        .catch((error) => {
          return res.status(200).send({
            status: true,
            message: error.message,
          });
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

//================================  Reset password via OTP =======================================//

const changePasswordByOTP = async function (req, res) {
  try {
    let otp = req.query.otp;

    let checkOTP = await userModel.findOne({ otp: otp });

    if (checkOTP) {
      let body = req.body;
      let { newPassword } = body;

      if (!newPassword || !newPassword.trim())
        return res.status(400).send({
          status: false,
          message: "Please provide password , it can't be empty",
        });

      if (!validatePassword(newPassword))
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid password" });

      let hashing = bcrypt.hashSync(newPassword, 8);
      newPassword = hashing;

      let changePassword = await userModel.findOneAndUpdate(
        { _id: checkOTP._id },
        { $set: { password: newPassword, otp: "" } },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "Password change successfully.",
        data: changePassword,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Your token may be invalid or expired.",
      });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  userRegistration,
  userLogin,
  forgotPasswordEmail,
  resetPasswordByLink,
  otpGeneratorEmail,
  changePasswordByOTP,
};
