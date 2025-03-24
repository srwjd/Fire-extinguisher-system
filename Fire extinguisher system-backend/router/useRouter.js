import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername,getUserCountByRole,getAllCompaniesWithBranches} from "../controller/useController.js";

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

// ดึงจำนวน User ใน Role
router.get("/countByRole", async (req, res) => {
    try {
        const result = await getUserCountByRole();
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No roles found" });
        }
        console.log("Roles Count :", result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching role count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ดึงจำนวน Unit
router.get("/countUnit", async (req, res) => {
    try {
        const result = await getAllCompaniesWithBranches(); // ดึงข้อมูลจากฐานข้อมูล
        if (result.length === 0) {
            return res.status(404).json({ message: "No companies found" });
        }
        res.json(result); // ส่งข้อมูลกลับไปยัง frontend
    } catch (error) {
        console.error("Error fetching companies:", error.message); // เพิ่มการพิมพ์ error
        res.status(500).json({ message: "Internal Server Error", error: error.message }); // ส่งข้อผิดพลาดพร้อมรายละเอียด
    }
});



export default router