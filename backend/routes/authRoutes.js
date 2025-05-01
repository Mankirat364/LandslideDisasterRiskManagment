import express from 'express'
import { createUser, logoutRoute, updateUser, verifyAccount, verifyToken, verifyUser } from '../controllers/authController.js';
import { checkToken } from '../middleware/checkToken.js';

const router  = express.Router();

router.post('/sign-up',createUser)
router.post('/sign-in',verifyUser)
router.get('/verify/:token',verifyAccount)
router.get('/checkToken',checkToken, verifyToken)
router.put('/updateAccount',updateUser)
router.delete('/logout',logoutRoute)
export default router