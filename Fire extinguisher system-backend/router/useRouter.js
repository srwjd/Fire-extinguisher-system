import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, getAllBranches, getBranchById } from "../controller/useController.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret"; // ใช้ ENV เพื่อความปลอดภัย

// 📌 API Login
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

// 📌 API ดึงข้อมูลสาขาทั้งหมด
router.get('/branches', async (req, res) => {
    try {
        const branches = await getAllBranches();
        return res.status(200).json(branches);
    } catch (error) {
        console.error("Fetch Branches Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 📌 API ดึงข้อมูลสาขาตาม branch_id
router.get('/branches/:branchId', async (req, res) => {
    const { branchId } = req.params;
    try {
        const branch = await getBranchById(branchId);
        if (branch.length === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        return res.status(200).json(branch[0]);
    } catch (error) {
        console.error("Fetch Branch Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;