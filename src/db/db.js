import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


const connectDB = async(MONGODB_URI) => {
    try{
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`Connection Success on Host !! : ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.error(`Connection to the MongDB failed: ${error.message}`)
    }
}

export default connectDB