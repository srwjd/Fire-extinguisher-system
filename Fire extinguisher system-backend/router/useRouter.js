import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, getAllBranchs, getBranchById, getBranchesByCompanyId, getFiresByBranchId, getFiresByCompanyId, getAllCompaniesWithBranches } from "../controller/useController.js";


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
        const companyId = result[0].company_id;
        const userID = result[0].userID

        console.log("User ID:", result[0].userID);

        return res.status(200).json({ message: 'OK success', token, role, companyId, userID});
    } catch (error) {
        res.status(500).json({ message: 'error' });
    }
    res.status(200).json({ token: 'token' });
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

        

        res.json(
            // branchDetails: result,
            fires
        );
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


router.get("/test2", async (req, res) => {
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