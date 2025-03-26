import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, getReport, getInspection, getAssign  } from "../controller/useController.js";



const router = Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await getUserByUsername(username)
        if (result.length === 0) {
            return res.status(400).json({ message: 'not found' });
        }
        // const match = await bcrypt.compare(password, result[0].password);
        const match = password === result[0].password
        if (!match) {
            return res.status(400).json({ message: 'not found' })
        }
        // const token = await jwt.sign({ id: result[0].id }, jwt_secret, { expiresIn: '1h' });
        const token = jwt.sign({ id: result[0].id }, 'secret', { expiresIn: '1h' });
        const role = result[0].roleName
        return res.status(200).json({ message: 'OK success', token, role });
    } catch (error) {
        res.status(500).json({ message: 'error' });
    }
    res.status(200).json({ token: 'token' });
})


router.get('/report', async (req, res) =>{
    try{
        const result = await getReport()
        if(result.length === 0){
            return res.status(404).json({ message: "No reports found" });
        }
        res.json(result)
    }catch(error){
        console.error("Error fetching reports:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
})



router.get('/inspec', async (req, res) =>{
    try{
        const result = await getInspection()
        if(result.length === 0){
            return res.status(404).json({message: "No Inspection found"})
        }
        res.json(result)
    }catch(error){
        console.error("Error fetching Inspection:", error.message)
        res.status(500).json({ message: "Internal server error" });
    }
})


router.get('/assign', async (req, res) => {
    try {
        const result = await getAssign();
        if (result.length === 0) {
            return res.status(404).json({ message: 'No fire extinguishers found' });
        }
        return res.status(200).json({ message: 'OK success', result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router

