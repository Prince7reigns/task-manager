import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async (userId) => {
   
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
    
        user.refreshToken=refreshToken;
    
        user.save({validateBeforeSave:false})
    
        return {accessToken,refreshToken}
    }
     catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerUser = asyncHandler (async (req,res) =>{

    const {fullName,username,email,password}=req.body
     console.log(`fullname: ${fullName}, email: ${email}, password: ${password}, username: ${username}`);

    if(
        [fullName,email,password,username].some((feilds => feilds?.trim()===""))
    ){
        throw new ApiError(400,"all feilds are required")
    }

    const exsitedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(exsitedUser){
        throw new ApiError(400,"username or email is already taken")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select( "-password -refreshToken")

    if(!createdUser){
         throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, createdUser, "User registered Successfully"))
})

const loginUser = asyncHandler( async (req,res)=>{
    console.log(req.body);
    
    const {username,email,password} = req.body;

     if(!email && !username){
        throw new ApiError(400,"Email or username are required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"Invalid username or email")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const isPasswordCorrect = await user?.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid password")
    }

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

     const options = {
        httpOnly: true,
        secure:true
        // by defualt any one can change cooke from fronted when use true the httponly and secure then its only changeable from server
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
         {
            $unset:{
                accessToken:1,
            }
         },
         {
            new:true
         }
    )

    const options = {
        httpOnly: true,
        secure:true
        // by defualt any one can change cooke from fronted when use true the httponly and secure then its only changeable from server
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
       throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)

        if(!user){
            throw new ApiError(401, "unauthorized request")
        }

         if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used") 
        }

       const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)

       const options = {
        httpOnly: true,
        secure:true
        // by defualt any one can change cooke from fronted when use true the httponly and secure then its only changeable from server
      }

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token generated"))

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword  = asyncHandler(async (req,res) =>{
    const {oldPassword, newPassword} = req.body

     if(!(oldPassword && newPassword)){
        throw new ApiError(400, "Old and new password are required")
     }

     const user = await User.findById(req.user?._id)

     if(!user){
        throw new ApiError(404, "User not found")
     }

     const isOldPasswordCorrect = await user?.isPasswordCorrect(oldPassword)

     if(!isOldPasswordCorrect){
        throw new ApiError(401, "Old password is incorrect")
     }

     user.password = newPassword
     await user.save({validateBeforeSave:false})

      return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetch successfully"))
})

const updateAccountDetails  = asyncHandler(async(req,res)=>{
    const {fullName, email, username} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "Full name and email are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{fullName, email,username},
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Account details updated successfully")
    )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails
  }