import express from 'express'
import { checkToken } from '../middleware/checkToken.js'
import { getMessageByRoom, saveMessage } from '../controllers/messageController.js'
const router = express.Router()

router.post('/saveMessage', checkToken , saveMessage)
router.get("/getRoomMessages/:room" ,checkToken,getMessageByRoom)

export default router