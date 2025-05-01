import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    user : {
        type :mongoose.Schema.Types.ObjectId,
        ref: "User" 
    },
    title : {
        type : String,
    },
    description : {
        type: String,
    },
    coordinates: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        }
    },
    severity : {
        type : String,
        enum: ["low", "medium", "high", "severe"],
        required : true
    },
    advisoryMessage: {
        type: String,
    },
    locationName: {
        type: String,
        required: true,
    },

},
    {timestamps : true}
)

const alert = mongoose.model("Alert",alertSchema);
export default alert
