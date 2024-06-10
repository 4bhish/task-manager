
import { Task } from "../models/task.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const creatTask = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some(field => field.trim() === "")) {
        throw new ApiError(400, "title and description of the task is required")
    }

    let taskImageLocalPath;
    if (req.file) {
        taskImageLocalPath = req.file.path
    }

    const taskImage = await uploadOnCloudinary(taskImageLocalPath)

    const owner = await User.findById(req.user._id)

    if (!owner) {
        throw new ApiError(401, "Invalid access")
    }

    await Task.create({
        title,
        description,
        taskImage: taskImage?.url || "",
        owner: owner._id
    })


    return res
        .status(201)
        .json(
            new ApiResponse(200, "Task created successfully", {})
        )

})


const updateTask = asyncHandler(async (req, res) => {

    const { id } = req.params;
    if (!id) {
        throw new ApiError(401, "Unauthorized access")
    }

    const { title, description } = req.body
    if ([title, description].some(field => field.trim() === "")) {
        throw new ApiError(400, "title and description is required")
    }


    const task = await Task.findById(id)

    if(!task){
        throw new ApiError(400,"Task is missing")
    }

    if (task.owner !== req.user._id) {
        throw new ApiError(403, "Forbidden  access")
    }

    const updatedTask = await Task.findByIdAndUpdate(task._id, {
        $set: {
            title: title,
            description: description
        }
    }, {
        new: true
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Task updated successfully", updatedTask)
        )

})

const updateTaskImage = asyncHandler(async (req,res) => {

    const {id} = req.params;
    if(!id){
        throw new ApiError(401,"Unauthorized access")
    }

    const task = await Task.findById(id)
    if(!task){
        throw new ApiError(400,"task is missing")
    }
    if(task.owner !== req.user._id){
        throw new ApiError(403,"Forbidden access")
    }

    let taskImageLocalPath

    if(req.file){
        taskImageLocalPath = req.file.path
    }

    if(!taskImageLocalPath){
        throw new ApiError(400,"Failed to upload task image")
    }

    const taskImage = await uploadOnCloudinary(taskImageLocalPath)

    if(!taskImage){
        throw new ApiError(400,"Failed to upload task image")
    }

    const updatedTask = await Task.findByIdAndUpdate(task._id,{
        $set:{
            taskImage:taskImage.url
        }
    },{
        new:true
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,"Task Image uploaded successfully",updateTask)
    )
})


const deleteTask = asyncHandler(async(req,res)=>{
    const {id} = req.params

    if(!id){
        throw new ApiError(401,"Unauthorized access")
    }

    const task = await Task.findById(id)
    if(!task ){
        throw new ApiError(400,"task is missing")
    }

    if(task.owner !== req.user._id){
        throw new ApiError(403,"Forbidden access")
    }

    await Task.findByIdAndDelete(task._id)

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Task Deleted Successfully",{})
    )
})

const deleteUserTasks = asyncHandler(async(req,res) => {

    const {ids} = req.body

    if(!ids  || !Array.isArray(ids) || ids.length === 0){
        throw new ApiError(400,"ids are missing")
    }

    const tasks = await Task.find({_id:{$in:ids}})
    const userId = req.user._id

    if(tasks.some(task => task.owner !== userId)){
        throw new ApiError(403,"Forbidden access")
    }

    await Task.deleteMany({_id:{
        $in:ids
    }})

    return res
    .status(200)
    .json(
        new ApiResponse(200,"All user tasks deleted successfully",{})
    )

})


export {
    creatTask,
    updateTask,
    updateTaskImage,
    deleteTask,
    deleteUserTasks
}