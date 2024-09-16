import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //  (1)  get user details from frontend
    //  (2)  validation - not empty
    //  (3)  check if user already exists: username, email
    //  (4)  check for images, check for avatar
    //  (5)  upload them to cloudinary, avatar
    //  (6)  create user object - create entry in db
    //  (7)  remove password and refresh token field from response
    //  (8)  check for user creation
    //  (9)  return res


    /*(1)*/
    const {fullName, email, username, password} = req.body
    console.log("email", email);
    
    
    

    /*(2)*/
    if (
      [fullName, email, username, password].some(
        (fields) => fields?.trim() === "" )  
    ) {
        throw new ApiError(400, "All fields are required")
    }

    /*(3)*/
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")   
    }

    /*(4)*/
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    /*(5)*/

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImage)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // ( 6 )
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // ( 7 )
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // ( 8 )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )


} )


export {
    registerUser,

}