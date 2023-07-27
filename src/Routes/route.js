const router = require("express").Router();
const { userRegistration , userLogin , forgotPassword , resetPassword } = require("../Controllers/userController");




// ===================================== User API's ====================================== //


router.post( "/registration" , userRegistration );
router.post( "/login" , userLogin );
router.post( "/forgotPassword" , forgotPassword );
router.get( "/resetPassword" , resetPassword )
// router.get( "/user/:userId/profile" , isAuthenticated , getUsers );
// router.put( "/user/:userId/profile" , isAuthenticated , isAuthorized , updateUser );



// ===================================== Invalid path ====================================== //


router.all('/*', ( req , res ) => {
    res.status(400).send({ status: false, message: "Path invalid." });
});


module.exports=router