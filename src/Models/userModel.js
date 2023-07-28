const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        userName : {
            type : String ,
            required : true ,
            trim : true
        } ,
        emailId : {
            type : String ,
            required : true ,
            trim : true
        } ,
        password :{
            type : String ,
            required : true ,
            trim :true
        } ,
        resetToken : {        
            type : String ,
            default : ''
        } ,
        otp :{
            type :Number ,
            default :''
        }
    } , {timestamps : true }
)

module.exports = mongoose.model('userData' , userSchema)