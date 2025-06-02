import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {
        createTask,
        getTasks,
        updateTask,
        deleteTask,
        getTeskById
} from "../controllers/task.controller.js"
import route from "./user.routes.js"

const router = Router()

router.route('/gp')
    .get(verifyJWT,getTasks)
    .post(verifyJWT,createTask)

router.route('/:id/gp')
    .get(verifyJWT,getTeskById)
    .put(verifyJWT,updateTask)
    .delete(verifyJWT,deleteTask)


export default router
