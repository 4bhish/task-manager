import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.json({ limit: "16kb" }))
app.use(express.static('public'))


// routes

import UserRouter from './routes/user.routes.js';
import TaskRouter from './routes/task.routes.js';

app.use('/api/v1/users',UserRouter)
app.use('/api/v1/tasks',TaskRouter)


export { app }