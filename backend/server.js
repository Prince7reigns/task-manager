import express from "express"
import cors from "cors"
import "dotenv/config"
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 4000

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

connectDB()

app.get('/', (req, res) => {
  res.send('Hello World! API working')
})

app.listen(port, ()=>{
    console.log("server has strted on local host ");
    
})

import userRouter from "./routes/user.routes.js"
import taskRouter from "./routes/task.routes.js"





app.use("/api/v1/users", userRouter)
app.use("/api/v1/tasks", taskRouter)