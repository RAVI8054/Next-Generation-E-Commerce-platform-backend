import UserModel from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import bcryptjs from "bcryptjs";
import sendEmailFun from "../config/sendEmail.js";

import jwt from 'jsonwebtoken'
import VerificationEmail from './../utils/verifyEmailTemplate.js';
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from './../utils/generatedRefreshToken.js';

import cookieParser from 'cookie-parser';


let imageArr = [];
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
});


export async function registerUserController(request, response) {
    try {
        let user;
        const { name, email, password } = request.body
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email,name,password",
                error: true,
                success: false
            })
        }
        // for check user alreday persent ot not
        user = await UserModel.findOne({ email: email })
        if (user) {
            return response.json({
                message: "Alreday user  register  with this email",
                error: true,
                success: false
            })
        }
        //Random otp gernating
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        //salt for extra secuirty
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000
        })

        await user.save()
        // send verification email

        await sendEmailFun({
            to: email,
            subject: "Verify email from Ecommerce App",
            text: "",
            html: VerificationEmail(name, verifyCode)
        })

        // Create Jwt token for verification process
        const token = jwt.sign(
            {
                email: user.email,
                id: user._id
            },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );
        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully ! please verify your email",
            token: token
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// for verification eamil controllers
export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            })
        }
        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires && user.otpExpires > Date.now();


        if (isCodeValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return response.status(200).json({ error: false, success: true, message: "Email verified successfully" })
        } else if (!isCodeValid) {
            return response.status(400).json({ error: true, success: false, message: "Invalid OTP" })
        } else {
            return response.status(400).json({ error: true, success: false, message: "OTP expired" })//  // OTP is correct but expired
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

export async function loginUserController(request, response) {
    try {
        const { email, password } = request.body;
        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "User not register",
                error: true,
                success: false
            })
        }
        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your email not verify yet please verify your email",
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password)
        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }

        const accesstoken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)

        // const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
        //      last_login_date : new Date(),
        //       access_token: accesstoken,
        //     refresh_token: refreshToken
        // })

        await UserModel.findByIdAndUpdate(user._id, {
            last_login_date: new Date(),
            access_token: accesstoken,
            refresh_token: refreshToken
        });


        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accesstoken', accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)

        return response.json({
            message: "Login succssfully",
            error: false,
            success: true,
            date: {
                accesstoken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//logout User
export async function logoutController(request, response) {
    try {
        const userid = request.userId // auth middleware
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.clearCookie('accesstoken', cookiesOption)
        response.clearCookie('refreshToken', cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: "",
            access_token: ""
        })

        return response.json({
            message: "LogOut succssfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Failed to Login",
            error: true,
            success: false
        })
    }
}


// export async function userAvatarController(request, response) {
//     try {
//         // console.log("request.files:", request.files);

//         imageArr = [];
//         const userId = request.userId;
//         const images = request.files;

//         if (!images || images.length === 0) {
//             return response.status(400).json({
//                 success: false,
//                 message: "No file uploaded"
//             });
//         }

//         const options = {
//             use_filename: true,
//             unique_filename: false,
//             overwrite: false
//         };

//         let uploadedUrl = "";

//         for (let i = 0; i < images.length; i++) {
//             try {
//                 // console.log(" Uploading file:", images[i].path);
//                 const result = await cloudinary.uploader.upload(images[i].path, options);
//                 // console.log(" Cloudinary result:", result.secure_url);
//                 uploadedUrl = result.secure_url;
//                 imageArr.push(result.secure_url);

//                 // Delete the local file after successful upload
//                 fs.unlinkSync(images[i].path);
//             } catch (error) {
//                 console.error("Cloudinary upload failed for:", images[i].filename, error);
//             }
//         }

//         //  Safe DB update
//         let updatedUser;
//         try {
//             // console.log("Updating avatar for user:", userId, "with URL:", uploadedUrl);
//             updatedUser = await UserModel.findByIdAndUpdate(
//                 userId,
//                 { avatar: uploadedUrl },
//                 { new: true }
//             );
//         } catch (dbError) {
//             console.error(" MongoDB update error:", dbError);
//             return response.status(500).json({
//                 success: false,
//                 message: "Failed to update avatar in DB",
//                 error: dbError.message
//             });
//         }

//         if (!updatedUser) {
//             return response.status(404).json({ success: false, message: "User not found" });
//         }

//         return response.status(200).json({
//             _id: userId,
//             avatar: uploadedUrl,
//             user: updatedUser
//         });

//     } catch (error) {
//         console.error(" Avatar upload error:", error);
//         return response.status(500).json({
//             message: "Failed to upload avatar",
//             error: true,
//             success: false
//         });
//     }
// }

//upload avtar
export async function userAvatarController(request, response) {
    try {
        imageArr = []
        const userId = request.userId
        const image = request.files;
        const user = await UserModel.findOne({ _id: userId })

        if (!user) {
            return response.status(500).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        //First Remove image from Cloudinary
        const imgUrl = user.avatar;
        const urlArr = imgUrl.split("/");
        const imageName = urlArr[urlArr.length - 1].split(".")[0];

        if (imageName) {
            // Destroy image using await (promise-based)
            const result = await cloudinary.uploader.destroy(imageName);


        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false
        }

        for (let i = 0; i < image?.length; i++) {
            try {
                // // First remove image From Cloudinary
                // const imgUrl = image[i].path;

                // //https://res.cloudinary.com/dyl4jzc4t/image/upload/v1759840624/1759840621541_Screenshot_41.png
                // // Extract public_id from the URL
                // const urlArr = imgUrl.split("/");
                // const imageName = urlArr[urlArr.length - 1].split(".")[0];

                // if (imageName) {
                //     // Destroy image using await (promise-based)
                //     const result = await cloudinary.uploader.destroy(imageName);

                // }

                const result = await cloudinary.uploader.upload(
                    image[i].path, options);
                // console.log("Cloudinary result:", result);
                imageArr.push(result.secure_url);

                // Delete the local file after successful upload
                fs.unlinkSync(`uploads/${request.files[i].filename}`);
            } catch (error) {
                console.error("Cloudinary upload failed for:", image[i].filename, error);
            }
        }
        console.log(" userId from auth middleware:", request.userId);

        // Update MongoDB avatar field


        user.avatar = imageArr[0]
        await user.save()
        return response.status(200).json({
            _id: userId,
            avtar: imageArr[0]
        })
    } catch (error) {
        return response.status(500).json({
            message: "Failed to Login",
            error: true,
            success: false
        })
    }
}

// image delete

export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;
        if (!imgUrl) {
            return response.status(400).json({ success: false, message: "No image URL provided" });
        }
        //https://res.cloudinary.com/dyl4jzc4t/image/upload/v1759840624/1759840621541_Screenshot_41.png
        // Extract public_id from the URL
        const urlArr = imgUrl.split("/");
        const imageName = urlArr[urlArr.length - 1].split(".")[0];

        if (!imageName) {
            return response.status(400).json({
                success: false,
                message: "Invalid image URL"
            });
        }

        // Destroy image using await (promise-based)
        const result = await cloudinary.uploader.destroy(imageName);

        return response.status(200).json({ success: true, result });
    } catch (error) {
        console.error("    Cloudinary delete error:", error);
        return response.status(500).json({ success: false, message: "Failed to delete image", error: error.message });
    }
}

// update  User Details

export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //from auth middleware
        const { name, email, mobile, password } = request.body;

        const userExist = await UserModel.findById(userId);
        if (!userExist) {
            return response.status(400).send('The user  cannot be Updated !')
        }
        let verifyCode = "";
        if (email !== userExist.email) {
            //Random otp gernating
            verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        }

        let hashPassword = "";
        if (password) {
            //salt for extra secuirty
            const salt = await bcryptjs.genSalt(10);
            hashPassword = await bcryptjs.hash(password, salt);
        } else {
            hashPassword = userExist.password;
        }

        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                name: name,
                mobile: mobile,
                email: email,
                verify_email: email !== userExist.email ? false : true,
                password: hashPassword,
                otp: verifyCode !== "" ? verifyCode : null,
                otpExpires: verifyCode !== "" ? Date.now() + 600000 : ''
            }, {
            new: true
        })
        if (email !== userExist.email) {
            // send verification email
            await sendEmailFun({
                sendTo: email,
                subject: "veriffy email from Ecommerce App",
                text: "",
                html: VerificationEmail(name, verifyCode)
            })
        }
        return response.json({
            message: "User Updated successfully",
            error: false,
            success: true,
            user: updateUser
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

// forgot password 

export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body
        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email Not available",
                error: true,
                success: false
            })
        } else {

            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            const updateUser = await UserModel.findByIdAndUpdate(
                user?._id,
                {
                    otp: verifyCode,
                    otpExpires: Date.now() + 600000
                },)

            // send verification email
            await sendEmailFun({
                to: email,
                subject: "Verify email from Ecommerce App",
                text: "",
                html: VerificationEmail(user?.name, verifyCode)
            })
            return response.json({
                message: "check your email",
                error: false,
                success: true
            })
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyForgotPasseordOtp(request, response) {
    try {
        const { email, otp } = request.body;
        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "user not avilable",
                error: true,
                success: false
            })
        }

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide required field email,otp",
                error: true,
                success: false
            })
        }


        if (otp !== user.otp) {
            return response.status(400).json({
                message: "Invalid Otp",
                error: true,
                success: false
            })
        }

        const currentTime = new Date().toISOString()
        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }
        user.otp = ""
        user.otpExpires = "";
        await user.save()

        return response.status(400).json({
            message: "Verify OTP successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//rest password Controller
export async function restpassword(request, response) {
    try {
        let { email, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                message: "Provide required fields email, newPassword, confirmPassword"
            })
        }

        let user = await UserModel.findOne({ email })
        if (!user) {
            return response.status(400).json({
                message: "user/Email not avilable",
                error: true,
                success: false
            })
        }

        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same",
                error: true,
                success: false,
            })
        }
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword, salt);
        const update = await UserModel.findByIdAndUpdate(
            user._id, {
            password: hashPassword
        }
        )

        return response.json({
            message: "password updated successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}

// Refresh Token

export async function refreshToken(request, response) {
    try {

        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" "[1]) //[bearer token]

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }
        const userId = verifyToken?._id
        const newAccessToken = await generatedAccessToken(userId)
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption)
        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            date: {
                accessToken: newAccessToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId
        console.log(userId)
        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message: "user details",
            date: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Somethings is wrong",
            error: true,
            success: false
        })
    }
}