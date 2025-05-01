import express from 'express'
import { checkToken } from '../middleware/checkToken.js';
import { fetchReports, reportCreation, reportDeletion } from '../controllers/reportController.js';
const router = express.Router();

router.post('/createReport',checkToken, reportCreation)
router.get('/getReports',checkToken,fetchReports)
router.delete('/deleteReport/:ReportId',checkToken,reportDeletion)




export default router