import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    locationName: {
        type: String,
        required: true,
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
    rainfall: {
        type: Number,
        required: true,
    },
    rainfallStatus: {
        type: String,
        enum: ["steady", "increasing", "decreasing"],
        required: true,
    },
    terrainType: {
        type: String,
        required: true,
    },
    soilType: {
        type: String,
        required: true,
    },
    altitude: {
        type: Number,
        required: true,
    },
    riskLevel: {
        type: String,
        enum: ["low", "medium", "high", "severe"],
        required: true,
    },
    rainfallForecast24h: {
        type: [String],
        required: true,
    },
    advisoryMessage: {
        type: String,
    },
    alerts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Alert"
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now,
    }
},
    { timestamps: true },
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
