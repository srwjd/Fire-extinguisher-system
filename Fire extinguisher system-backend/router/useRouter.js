import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, getReport, getFiresByIds, insertInspection, getUnit, updateStatus } from "../controller/useController.js";

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
        const role = result[0].role_name
        const userID = result[0].user_id
        return res.status(200).json({ message: 'OK success', token, role, userID });
    } catch (error) {
        res.status(500).json({ message: 'error' });
    }
    res.status(200).json({ token: 'token' });
})

router.get('/getreports/:userID', async (req, res) => {
    const { userID } = req.params;
    try {
        const result = await getReport(userID);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Not found' });
        }
        return res.status(200).json({ message: 'OK success', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/getfire/:fire_ids', async (req, res) => {
    try {
        const fireIds = req.params.fire_ids.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

        if (fireIds.length === 0) {
            return res.status(400).json({ message: "Invalid fire IDs" });
        }

        const result = await getFiresByIds(fireIds);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No fire extinguishers found' });
        }
        return res.status(200).json({ message: 'OK success', result });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/insertinspection/:fire_id', async (req, res) => {
    try {
        const { fire_id } = req.params;
        const { filename, description, date, time, user_id, assign_id, condition_ok, pressure_ok, nozzle_clear, pin_sealed, placement_correct } = req.body;

        // เรียกใช้ insertInspection และรอผล
        await insertInspection({
            fire_id, filename, description, date, time, user_id, assign_id,
            condition_ok, pressure_ok, nozzle_clear, pin_sealed, placement_correct
        });

        // ส่ง Response ถ้าบันทึกสำเร็จ
        return res.status(200).json({ message: 'บันทึกผลการตรวจสอบเรียบร้อย' });

    } catch (error) {
        console.error("Error occurred while inserting inspection:", error);

        // ส่ง Response เมื่อเกิดข้อผิดพลาด
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: error.message });
    }
});

router.post('/updatestatus', async (req, res) => {
    const { fire_id } = req.body;
    try {
        const result = await updateStatus({fire_id});
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Fire extinguisher not found' });
        }
        return res.status(200).json({ message: 'OK success' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/getassigns', async (req, res) => {
    try {
        const result = await getUnit();
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