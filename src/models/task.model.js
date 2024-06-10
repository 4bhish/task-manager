import { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const taskSchema = new Schema(
    {
        title:{
            type:String,
            required:true,
            index:true
        },
        description:{
            type:String,
            required:true,
        },
        taskImage:{
            type:String,
        },
        owner:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:'User'
        },
        isCompleted:{
            type:Boolean,
            default:false,
        }
    },
    {timestamps:true}

)


taskSchema.plugin(mongooseAggregatePaginate)
export const Task = model('Task',taskSchema)