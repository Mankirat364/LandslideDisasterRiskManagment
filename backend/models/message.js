import mongoose from 'mongoose'
const messageSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    senderName : {
        type : String,
    },
    text : {
        type : String,
        required : true,
    },
    room : {type : String, default : 'general'}
},
{timestamps : true}

)

const messages = mongoose.model("Message",messageSchema);
export default messages