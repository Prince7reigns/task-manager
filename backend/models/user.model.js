import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema ({
     username: {
           type: String,
           required: [true, "Username is required"], // ✅ Custom error message
           unique: true,
           lowercase: true, 
           trim: true,
           index: true // ✅ Helps in faster search queries
       },
       email: {
           type: String,
           required: [true, "Email is required"], // ✅ Custom error message
           unique: true,
           lowercase: true,
           trim: true,
       },
       fullName: {
           type: String,
           required: [true, "Full name is required"], // ✅ Custom error message
           trim: true,
           index: true
       },
       password: {
           type: String,
           required: [true, "Password is required"], // ✅ Custom error message
           trim: true,
       },
       refreshToken:{
           type:String
       }
},
{
       timestamps:true
})

userSchema.pre("save" , async function (next) {
    if(!this.isModified("password") ) next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
           _id:this._id,
           username:this.username,
           email:this.email,
           fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
      )
}

userSchema.methods.generateRefreshToken= function (){
     return jwt.sign(
      {
         _id:this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      }
    )
 }

export const User = mongoose.model("User" , userSchema)
