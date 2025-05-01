import Report from "../models/report.js";

export const reportCreation = async (req, res) => {
    const {
        locationName,
        coordinates,
        rainfall,
        rainfallStatus,
        terrainType,
        soilType,
        altitude,
        riskLevel,
        rainfallForecast24h,
        advisoryMessage
    } = req.body;

    try {
        const report = await Report.create({
            locationName,
            coordinates,
            rainfall,
            rainfallStatus,
            terrainType,
            soilType,
            altitude,
            riskLevel,
            rainfallForecast24h,
            advisoryMessage,
            user:req.user.id
        });

        if (!report) {
            return res.status(500).json({
                message: "Something went wrong, try again",
            });
        }
        res.status(201).json({
            message: "Report generated successfully",
            report,
        });

    } catch (error) {
        console.error(error.message || error);
        res.status(500).json({
            message: "Internal Server error: " + error
        });
    }
};

export const fetchReports = async(req,res) =>{
    try {
        const reports = await Report.find().populate('user', "fullName email");
        if(!reports){
            return res.status(400).json({
                message : "No Report found"
            })
        }
        res.status(200).json({
            message :"Reports Fetched Successfully",
            reports
        })
    } catch (error) {
        
    }
}
export const reportDeletion  = async(req,res) =>{
    const {ReportId} = req.params;
    try {
        if(!ReportId){
            return res.json(400).json({
                message : "Report Id is not provided"
            })
        }
        const deleteReport = await Report.findByIdAndDelete(ReportId);
        if(!deleteReport){
            return res.status(400).json({
                message : "No report found"
            })
        }
        res.status(200).json({
            message : "report sucessfully deleted"
        })
    } catch (error) {
        res.status(500).json({
            message :`Internal Server error ${error}`
        })
    }
}