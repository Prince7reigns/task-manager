import {Router} from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"


const route = Router()

route.post("/register",registerUser)
route.post("/login",loginUser)
route.route("/refresh-token").post(refreshAccessToken)

route.route("/me").get(verifyJWT, getCurrentUser)
route.route("/profile").put(verifyJWT ,updateAccountDetails)
route.route("/password").put(verifyJWT ,changeCurrentPassword)
route.route("/logout").post(verifyJWT,logoutUser)

export default route
