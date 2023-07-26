const userModel = require("../Models/userModel")

const {validateUserName , validatePassword , validateEmailId} = require("../Validation/validation")

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");


//================================= Register User ================================================//

const userRegistration = async function (req , res ){
    // try{

        let body = req.body
        let {userName , emailId , password} = body

        if (Object.keys(body).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Body can't be empty" });

    if (!userName || !userName.trim())
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide user name or it can't be empty",
        });

    if (!validateUserName(userName))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid  user name" });
   
        if (!emailId || !emailId.trim())
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide emailId or it can't be empty",
        });

    if (!validateEmailId(emailId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid  emailId" });

        if (!password || !password.trim())
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide password or it can't be empty",
        });

    if (!validatePassword(password))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid password" });

        
    let hashing = bcrypt.hashSync(password, 8);
    body.password = hashing;

        let checkDuplicate = await userModel.findOne({$or:[{userName : userName} , {emailId : emailId}]})

        if (checkDuplicate === null )
        {
          let userRegister = await userModel.create(body);
    
          return res.status(201).send({
            status: true,
            message: "User login successfully.",
            data: userRegister,
          });
        }


        if (checkDuplicate.emailId === emailId) {
          return res.status(400).send({
            status: false,
            message: "This email ID is already registered.",
          });
        } else (checkDuplicate.userName === userName) 
          return res.status(400).send({
            status: false,     
            message: "This user name is already registered.",
          });
        }
        // } else
        //   (checkDuplicate === null )
        // {
        //   let userRegister = await userModel.create(body);
    
        //   return res.status(201).send({
        //     status: true,
        //     message: "User login successfully.",
        //     data: userRegister,
        //   });
        // }

    // }catch(error){
    //     return res.status(500).send({status : false , message : error.message})
    // }




module.exports={userRegistration}