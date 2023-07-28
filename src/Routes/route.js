const router = require("express").Router();
const { userRegistration , userLogin , forgotPasswordEmail , resetPasswordByLink , otpGeneratorEmail , changePasswordByOTP } = require("../Controllers/userController");



// ===================================== User API's ====================================== //


router.post( "/registration" , userRegistration );
router.post( "/login" , userLogin );
router.post( "/forgotPassword" , forgotPasswordEmail );
router.patch( "/resetPassword" , resetPasswordByLink )
router.post( "/otpGenerator" , otpGeneratorEmail )
router.patch( "/changePassword" , changePasswordByOTP )



// ===================================== Invalid path ====================================== //


router.all('/*', ( req , res ) => {
    res.status(400).send({ status: false, message: "Path invalid." });
});


module.exports=router