import mongoose from "mongoose"

export const connection = async()=>{
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      if(conn){
        console.log("sucessfully connected to the database")
      }
    } catch (error) {
        console.error(error)
    }
}