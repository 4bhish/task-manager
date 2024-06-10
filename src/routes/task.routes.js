import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { creatTask, deleteTask, deleteUserTasks, updateTask, updateTaskImage } from "../controllers/task.controllers.js";

const router = Router()

router.route('/create-task').post(verifyJwt,upload.single('taskImage'),creatTask)
router.route('/update-task/:id').patch(verifyJwt,updateTask)
router.route('/update-image/:id').patch(verifyJwt,upload.single('taskImage'),updateTaskImage)
router.route('/delete-task/:id').delete(verifyJwt,deleteTask)
router.route('delete-users-taks').delete(verifyJwt,deleteUserTasks)

export default router