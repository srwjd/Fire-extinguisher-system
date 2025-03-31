import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, getReport, getInspection, getAssign, sendAssign , getFire ,  fireUpdateStatus, sendReports, deleteProcess, updatedStatus, updatedStatusComplete} from "../controller/useController.js";



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
        const role = result[0].role_name;
        const userID = result[0].user_id

        console.log("User ID:", result[0].user_id);

        return res.status(200).json({ message: 'OK success', token, role, userID });
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


router.put('/sendAssign', async (req, res) => {
   try{
    const { date, time, assign_by, report_id, insp_id } = req.body;
    const result = await sendAssign({date, time, assign_by, report_id, insp_id});
    if (result.length === 0) {
        return res.status(404).json({ message: 'No fire extinguishers found' });
    }
    return res.status(200).json({ message: 'OK success', result });
   }catch(error){
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' });
   }
})

router.get('/fire', async (req, res) => {
    try {
        const result = await getFire();
        if (result.length === 0) {
            return res.status(404).json({ message: 'No fire extinguishers found' });
        }
        return res.status(200).json({ message: 'OK success', result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.put('/fireUpdateStatus', async (req, res) => {
    const { report_id, status } = req.body;
    
    try {
        const result = await fireUpdateStatus({ report_id, status });
        if (result.length === 0) {
            return res.status(404).json({ message: 'No fire extinguishers found' });
        }
        return res.status(200).json({ message: 'OK success', result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post("/sendReports", async (req, res) => {
    try {
        const { description, date, time, fire_id, user_id } = req.body;
        const filename = null;

        // Check for required fields
        if (!description || !date || !time || !fire_id || !user_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const report = { filename, description, date, time, fire_id, user_id };

        // Add report and assign simultaneously
        const result = await sendReports(report);
        console.log("sendReports body", req.body);
        res.status(201).json({ message: "Report added successfully", data: result });
    } catch (error) {
        console.error("Error adding report:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.delete("/deleteProcess", async (req, res) => {
    try {
        const { inspection_id} = req.body;
        const result = await deleteProcess(inspection_id);
        res.status(200).json({ message: "Report deleted successfully", data: result });
    } catch (error) {
        console.error("Error deleting report:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.post("/updatedStatus", async (req, res) => {
    try {
        const { fire_id } = req.body;
        const result = await updatedStatus (fire_id);
        res.status(200).json({ message: "Status updated successfully", data: result });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.post("/updatedStatusComplete", async (req, res) => {
    try {
        const { fire_id } = req.body;
        const result = await updatedStatusComplete (fire_id);
        res.status(200).json({ message: "Status updated successfully", data: result });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export default router
