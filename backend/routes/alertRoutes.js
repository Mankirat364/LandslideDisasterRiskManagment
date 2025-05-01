import express from 'express'
import { checkToken } from '../middleware/checkToken.js'
import { alertCreation, allAlert, allAlertGoing, deleteAlert, getPrivateAlert } from '../controllers/alertController.js'
const router = express.Router()

router.post('/createAlert',checkToken, alertCreation)
router.get('/getMyAlert', checkToken,getPrivateAlert )
router.get('/allAlert',checkToken , allAlert)
router.get('/allAlertOngoing' , allAlertGoing)
router.delete('/deleteAlert/:alertId',checkToken, deleteAlert)


export default router