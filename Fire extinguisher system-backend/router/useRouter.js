import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, getAllBranchs, getBranchById, getBranchesByCompanyId, getFiresByBranchId, getFiresByCompanyId, addReport, getFiresById} from "../controller/useController.js";
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const router = Router();

// ใช้ fileURLToPath เพื่อแปลง URL ให้เป็นพาธในระบบไฟล์
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ตรวจสอบและสร้างโฟลเดอร์ uploads หากไม่มี
const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true }); // สร้างโฟลเดอร์ถ้ายังไม่มี
}
// ตั้งค่าให้บันทึกไฟล์ในโฟลเดอร์ 'uploads' และตั้งชื่อไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory); // กำหนดตำแหน่งการบันทึกไฟล์
    },
    filename: (req, file, cb) => {
        // แยกชื่อไฟล์ออกจากนามสกุล
        const extname = path.extname(file.originalname); // เช่น .txt
        const basename = path.basename(file.originalname, extname); // เช่น dashboardAS
        
        // สร้างชื่อไฟล์ใหม่ที่มี timestamp ต่อท้าย
        const timestamp = Date.now();
        const newFilename = `${basename}-${timestamp}${extname}`; // เช่น dashboardAS-1742929442831.txt

        cb(null, newFilename); // ใช้ชื่อไฟล์ใหม่ที่ประกอบด้วย timestamp
    },
});

const upload = multer({ storage: storage });

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
        const companyId = result[0].company_id;
        const userID = result[0].user_id

        console.log("User ID:", result[0].user_id);
        console.log("Company ID:", result[0].company_id);
        return res.status(200).json({ message: 'OK success', token, role, companyId, userID});
    } catch (error) {
        res.status(500).json({ message: 'error' });
    }
})

// ดึงข้อมูลสาขาทั้งหมด
router.get("/branches", async (req, res) => {
    try {
        const result = await getAllBranchs();
        if (result.length === 0) {
            return res.status(404).json({ message: "No branches found" });
        }
        res.json(result);
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ดึงข้อมูลสาขาและถังดับเพลิงตาม branch_id
router.get("/branches/:branchs_id", async (req, res) => {
    try {
        const { branchs_id } = req.params;
        const result = await getBranchById(branchs_id);
    if (result === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        //ดึงข้อมูลถังตาม branch_id
        const fires = await getFiresByBranchId(branchs_id)
        res.json(fires);
    } catch (error) {
        console.error("Error fetching branch by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ดึงข้อมูลสาขาและถังดับเพลิงตาม company_id
router.get("/company/:company_id", async (req, res) => {
    try {
        const { company_id } = req.params;

        if (!company_id) {
            return res.status(400).json({ message: "Invalid company ID" });
        }

        const result = await getBranchesByCompanyId(company_id);
        if (result.length === 0) {
            return res.status(404).json({ message: "No branches found for this company" });
        }

        const fire = await getFiresByCompanyId(company_id)
        if (fire.length === 0) {
            return res.status(404).json({ message: "No fires found for this company" });
        }

        res.json({ branches: result, fires: fire });
    } catch (error) {
        console.error("Error fetching branches by company ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ดึงถังดับเพลิงตาม company_id
router.get("/company/:company_id/fires", async (req, res) => {
    try {
        const { company_id } = req.params;

        if (!company_id) {
            return res.status(400).json({ message: "Invalid company ID" });
        }

        // ดึงข้อมูลถังดับเพลิงทั้งหมดของบริษัท โดยไม่สนใจสาขา
        const fires = await getFiresByCompanyId(company_id);

        // ถ้าไม่มีถังดับเพลิงเลย ก็ให้ส่งอาร์เรย์ว่างแทนที่จะส่ง error 404
        res.json(fires || []);
    } catch (error) {
        console.error("Error fetching fires by company ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// API Endpoint สำหรับเพิ่มรายงาน
router.post("/reports", upload.single('filename'), async (req, res) => {
    try {
        const { description, date, time, fire_id, user_id } = req.body;
        const filename = req.file ? req.file.filename : null; // ใช้ชื่อไฟล์จาก multer

        // ตรวจสอบค่าที่ต้องการ
        if (!filename || !description || !date || !time || !fire_id || !user_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const report = { filename, description, date, time, fire_id, user_id };

        // สมมุติว่าใช้ฟังก์ชันเพิ่มรายงาน
        const result = await addReport(report);

        res.status(201).json({ message: "Report added successfully", data: result });
    } catch (error) {
        console.error("Error adding report:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// ดึงข้อมูลถังดับเพลิงตาม fire_id
router.get("/fire/:fire_id", async (req, res) => {
    try {
        const { fire_id } = req.params;
        const result = await getFiresById(fire_id);
        if (result.length === 0) {
            return res.status(404).json({ message: "Fire not found" });
        }
        console.log("Fire ID:", fire_id);
        res.json(result);
    } catch (error) {
        console.error("Error fetching fire by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


export default router;
