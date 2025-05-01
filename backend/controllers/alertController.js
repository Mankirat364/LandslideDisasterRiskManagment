import alert from "../models/alert.js"
import { getSocket } from "../lib/socket.js"
import mongoose from "mongoose"
export const alertCreation = async(req,res) =>{
    const {coordinates,severity,locationName} = req.body
    
    try {
        const newAlert = await alert.create({
            severity,
            locationName,
            coordinates,
            user:req.user.id
        })    
        if(!newAlert){
            return res.status(400).json({
                message : "problem making new Alert"
            })
        }
        const io = getSocket();
        io.emit("newAlert", newAlert); 
        res.status(201).json({
            message : "Alert is sucessfully created",
            newAlert
        })
    } catch (error) {
        res.status(400).json({
            message : "Something went wrong" + error.message
        })
    }
}
export const getPrivateAlert = async (req, res) => {
    try {
      const alerts = await alert.find({ user: req.user.id }).populate('user', "fullName email").sort({ createdAt: -1 });
  
      if (!alerts.length) {
        return res.status(404).json({
          message: "No alerts found for this user",
        });
      }
    
      res.status(200).json({
        message: "User alerts fetched successfully",
        alerts,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error fetching alerts: " + error.message,
      });
    }
  };

  export const allAlert = async (req, res) => {
    try {
      const myId = req.user.id;
  
      const alerts = await alert.find({
        user: { $ne: myId },
      }).populate("user", "fullName email");
  
      if (!alerts || alerts.length === 0) {
        return res.status(404).json({
          message: "No alerts found excluding your own.",
        });
      }
    
      res.status(200).json({
        message: "Alerts successfully fetched.",
        alerts,
      });
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({
        message: "Server error while fetching alerts.",
      });
    }
  };

export const allAlertGoing = async(req,res) =>{
  try {
    const alert2  = await alert.find().populate('user', "fullName email");
    if(!alert2){
      return res.status(400).json({
        message : "No Alert Found"
      })
    }
    if (!alert2 || alert2.length === 0) {
      return res.status(400).json({
        message: "No alerts found"
      });
    }
    res.status(200).json({
      message : "all alerts fetched succesfully",
      alert2
    })
  } catch (error) {
      console.error(error)
  }
}
export const deleteAlert = async(req,res) =>{
  const {alertId} = req.params;
  try {
    if(!alertId){
      return res.status(400).json({
        message : "alert id is not provided"
      })
    }
    const alertDelete = await alert.findByIdAndDelete(alertId);
    if(!alertDelete){
      return res.status(400).json({
        message : "Something Went wrong alert is not deleted successfully"
      })
    }
    res.status(200).json({
      message : "alert deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      message : "Something went wrong in deletion of the alert"
    })
  }
  

}