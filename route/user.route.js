import { Router } from "express";
import {
    forgotPasswordController,
    loginUserController,
    logoutController,
    refreshToken,
    registerUserController,
    removeImageFromCloudinary,
    restpassword,
    updateUserDetails,
    userAvatarController,
    userDetails,
    verifyEmailController,
    verifyForgotPasseordOtp
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router()
userRouter.post('/register', registerUserController)
userRouter.post('/verifyEmail', verifyEmailController)
userRouter.post('/login', loginUserController)
userRouter.post('/logout', auth, logoutController)
userRouter.put('/user-avatar', auth, upload.array('avatar'), userAvatarController)
userRouter.delete('/deleteImage', auth, removeImageFromCloudinary)
userRouter.post('/forgot-password', forgotPasswordController)
userRouter.post('/verify-forgot-password-otp', verifyForgotPasseordOtp)

userRouter.put('/reset-password', restpassword)
userRouter.put('/user/:id', auth, updateUserDetails)
userRouter.post('/refresh-token', auth, refreshToken)
userRouter.get('/user-details', auth, userDetails)
export default userRouter;
