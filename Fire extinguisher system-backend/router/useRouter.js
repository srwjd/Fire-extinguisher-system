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
        const result = await getUserByUsername(username);
        if (result.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password); // ใช้ bcrypt เปรียบเทียบรหัสผ่าน
        if (!match) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ id: user.id, role: user.roleName }, JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({
            message: "Login success",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.roleName
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

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