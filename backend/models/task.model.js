import mongoose ,{Schema} from "mongoose";


const taskSchema= new Schema({
    title:{
        type:String,
        required: [true, "title is required"]
    },
    description: {
        type: String,
        default:' '
    },
    periorty:{
        type:String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    
},
{
    timestamps: true
})

export const Task = mongoose.model("Task" , taskSchema)



