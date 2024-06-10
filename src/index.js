import { app } from "./app.js";
import connectDB from "./db/db.js";



connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log(`Error using port : ${error}`)
            throw error
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Listening on Port ${process.env.PORT}`)
        })
    }
    )
    .catch((error) => console.error(`Connection to the mongDB failed ${error.message}`))