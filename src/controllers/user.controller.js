import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import jwt from 'jsonwebtoken';

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, username, email, password } = req.body

    if ([fullname, username, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const userAlreadyExist = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (userAlreadyExist) {
        throw new ApiError(401, "User with same email or username already exists")
    }

    let avatarLocalPath
    if (req.file) {
        avatarLocalPath = req.file.path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(404, "Avatar not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(409, "Avatar failed to upload avatar")
    }

    const user = await User.create({
        fullname,
        username: username.trim(),
        email,
        password,
        avatar: avatar.url,
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken')

    return res.status(200).json(
        new ApiResponse(
            201,
            "User created Successfully",
            createdUser
        )
    )
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Failed to generate Access Token")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    console.log(password);
    if (!username && !email) {
        throw new ApiError(404, 'Username or email is required');
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User with email or username not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    console.log(isPasswordCorrect);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Entered user password incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "User logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken
            })
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: null
        },
    },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(201, "User logged out successfully", {})
        )
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Unauthorized access")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token expired or used")
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(201)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(201, "access token refreshed successfully", {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })
        )

})

const changeUserPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(404, "please enter old and new password")
    }
    const user = await User.findById(req.user?._id)

    console.log("This is old", oldPassword)

    if (!user) {
        throw new ApiError(401, "Unauthorized Access")
    }

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isOldPasswordCorrect) {
        throw new ApiError(401, "Password does not match")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Password changed successfully", {})
        )
})

const getTheCurrentUser = asyncHandler(async (req, res) => {
    const user = await findById(req.user._id).select("-refreshToken -password")

    return res.status(201)
        .json(
            new ApiResponse(200, "Fetched current user successfully", { currentuser: user })
        )
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullname, username } = req.body
    if ([fullname, username].some(field => field.trim() === "")) {
        throw new ApiError(409, "All fields are required ")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            fullname: fullname,
            username: username
        }
    },
        {
            new: true
        }).select("-password -refreshToken")

    return res.status(200)
        .json(
            new ApiResponse(201, "User details updated successfully", user)
        )

})


const getUserTasks = asyncHandler(async(req,res)=>{
    const tasks = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:'tasks',
                foreignField:'owner',
                localField:'_id',
                as:'user_tasks',
                pipeline:[
                    {
                        $sort:{
                            updatedAt:-1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                user_tasks:1
            }
        }
    ])


    if(!tasks){
        throw new ApiError(401,"Invalid Access")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"user tasks fetched successfully",tasks[0].user_tasks)
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeUserPassword,
    getTheCurrentUser,
    updateUserDetails,
    getUserTasks
}