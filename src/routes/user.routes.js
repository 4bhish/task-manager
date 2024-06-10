import { Router } from "express";
import { changeUserPassword, getTheCurrentUser, getUserTasks, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route('/register').post(
    upload.single('avatar'),
    registerUser
)

router.route('/login').post(loginUser)
router.route('/logout').post(verifyJwt,logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJwt,changeUserPassword)

router.route('/current-user').post(verifyJwt,getTheCurrentUser)
router.route('/update-user-details').post(verifyJwt,updateUserDetails)
router.route('/user-tasks').get(verifyJwt,getUserTasks)

export default router