import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  getUserByUsername, getAllBranchs, getAllBranches, getAllCompanys, getBranchById, getBranchesByCompanyId, getFiresByBranchId, getFiresByCompanyId, addReport, getFiresById,
  getUserCountByRole, getAllCompaniesWithBranches, getFireExtinguishersByMonth, getAllUser, addUser, updateUser, deleteUser, getAllUnit,
  addCompany, editCompany, deleteBranchAndFires, getReport, getFiresByIds, insertInspection, updateStatus, getReportAdmin, getInspection,
  getAssign, sendAssign, getFire, fireUpdateStatus, sendReports, deleteProcess, updatedStatus, updatedStatusComplete, getAllUserUser,
  getUserById, editNameAndImage
} from "../controller/useController.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import express from 'express';


const router = Router();

// ใช้ fileURLToPath เพื่อแปลง URL ให้เป็นพาธในระบบไฟล์
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    const companyId = result[0].company_id || null
    const branchId = result[0].branch_id || null
    const userID = result[0].user_id
    const firstname = result[0].firstname;
    const surname = result[0].surname;

    console.log("User ID:", result[0].user_id);
    console.log("Company ID:", result[0].company_id);
    return res.status(200).json({ message: 'OK success', token, role, companyId, userID, branchId, firstname, surname });
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
  res.status(200).json({ token: 'token' });
})

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

router.get("/countUnit", async (req, res) => {
  try {
    const result = await getAllCompaniesWithBranches(); // ดึงข้อมูลจากฐานข้อมูล
    if (result.length === 0) {
      return res.status(404).json({ message: "No companies found" });
    }
    res.json(result); // ส่งข้อมูลกลับไปยัง frontend
  } catch (error) {
    console.error("Error fetching companies:", error.message); // เพิ่มการพิมพ์ error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message }); // ส่งข้อผิดพลาดพร้อมรายละเอียด
  }
});

// ดึงจำนวนถังดับเพลิงและสถานะมาโชว์
router.get("/fireExtinguishersByMonth", async (req, res) => {
  try {
    const result = await getFireExtinguishersByMonth();
    console.log("Fetched result:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("🔥 Error fetching fire extinguishers data:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Manage User
router.get("/showAllUser", async (req, res) => {
  try {
    const result = await getAllUser();
    if (result === 0) {
      return res.status(404).json({ message: "No companies found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching companies:", error.message); // เพิ่มการพิมพ์ error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Add user
router.post("/addUser", async (req, res) => {
  try {
    const result = await addUser(req.body);
    res.status(201).json({ message: "User added successfully", result });
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// อัปเดตข้อมูลผู้ใช้
router.put("/updateUser/:id", async (req, res) => {
  const userId = req.params.id;
  const userData = req.body;

  // ตรวจสอบว่า role ถูกเลือกเป็น Main Branch หรือ Sub Branch หรือไม่
  if (userData.role === "MainBranch" && !userData.company_id) {
    return res.status(400).json({ message: "Company is required for Main Branch role" });
  }

  if (userData.role === "SubBranch" && !userData.branch_id) {
    return res.status(400).json({ message: "Branch is required for Sub Branch role" });
  }

  try {
    const result = await updateUser(userId, userData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }
    res.status(200).json({ message: "User updated successfully", result });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// ลบผู้ใช้
router.delete("/deleteUser/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await deleteUser(userId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// showAllUnit
router.get("/getAllUnit", async (req, res) => {
  try {
    const result = await getAllUnit();
    if (result.length === 0) {
      return res.status(404).json({ message: "No units found" });
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add Company
router.post("/addCompany", async (req, res) => {
  try {
    const { company_name, branch_name, quantity } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วน
    if (!company_name || !branch_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // เรียกใช้ฟังก์ชัน addCompany
    const result = await addCompany({ company_name, branch_name, quantity });

    // ถ้ามี branch_name ซ้ำ ให้ตอบกลับข้อความที่เตือนว่า branch_name ซ้ำ
    if (result.message.includes("already exists")) {
      return res.status(409).json(result); // 409 Conflict เพื่อบอกว่ามีข้อมูลซ้ำ
    }

    // ถ้าเพิ่มได้สำเร็จ
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding company:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Edit company and branch
router.put("/editCompany/:company_id/:branch_id", async (req, res) => {
  const { company_id, branch_id } = req.params;
  const { branch_name, ...extraFields } = req.body;

  if (!branch_name) {
    return res.status(400).json({ error: "Branch name must be provided." });
  }

  console.log("Received parameters:", { company_id, branch_id, branch_name });

  const allowedFields = ['branch_name'];
  const invalidFields = Object.keys(extraFields).filter(field => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
  }

  try {
    const result = await editCompany(company_id, branch_id, { branch_name });

    if (result) {
      return res.status(200).json(result);
    }

    res.status(500).json({ message: "Failed to update branch." });
  } catch (error) {
    console.error("Error updating branch:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Delete Branch And Extinguishers
router.delete("/deleteBranchAndFires/:branch_id", async (req, res) => {
  const branchId = req.params.branch_id; // รับค่า branch_id จาก URL
  try {
    const result = await deleteBranchAndFires(branchId); // เรียกใช้ฟังก์ชัน deleteBranchAndFires
    res.status(200).json(result); // ส่งผลลัพธ์การลบกลับ
  } catch (error) {
    console.error("Error deleting branch and fire extinguishers:", error.message);
    res.status(500).json({ message: "Failed to delete branch and extinguishers", error: error.message });
  }
});

router.get("/companys", async (req, res) => {
  try {
    const result = await getAllCompanys();
    if (result.length === 0) {
      return res.status(404).json({ message: "No companys found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching companys:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

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
router.get("/branches/:branch_id", async (req, res) => {
  try {
    const { branch_id } = req.params;

    if (!branch_id) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const result = await getBranchById(branch_id);
    if (!result) {  // เปลี่ยนจาก result === 0 เป็น !result
      return res.status(404).json({ message: "Branch not found" });
    }

    // ดึงข้อมูลถังดับเพลิงตาม branch_id
    const fires = await getFiresByBranchId(branch_id);
    if (!fires) {
      return res.status(500).json({ message: "Failed to fetch fire extinguisher data" });
    }

    res.json({ branch: fires });
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


router.put('/insertinspection/:fire_id', upload.single('filename'), async (req, res) => {
  try {
    const { fire_id } = req.params;
    const filename = req.file ? req.file.filename : null;
    const {
      description, date, time, user_id, assign_id,
      condition_ok, pressure_ok, nozzle_clear, pin_sealed, placement_correct
    } = req.body;

    // แปลงค่าจาก 'true' หรือ 'false' เป็น 1 หรือ 0
    const inspectionData = {
      fire_id,
      filename,
      description,
      date,
      time,
      user_id,
      assign_id,
      condition_ok: condition_ok === 'true' ? 1 : 0,
      pressure_ok: pressure_ok === 'true' ? 1 : 0,
      nozzle_clear: nozzle_clear === 'true' ? 1 : 0,
      pin_sealed: pin_sealed === 'true' ? 1 : 0,
      placement_correct: placement_correct === 'true' ? 1 : 0
    };

    // บันทึกข้อมูลลงฐานข้อมูล
    await insertInspection(inspectionData);

    return res.status(200).json({ message: 'บันทึกผลการตรวจสอบเรียบร้อย' });

  } catch (error) {
    console.error("Error occurred while inserting inspection:", error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: error.message });
  }
});



router.post('/updatestatus', async (req, res) => {
  const { fire_id } = req.body;
  try {
    const result = await updateStatus({ fire_id });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Fire extinguisher not found' });
    }
    return res.status(200).json({ message: 'OK success' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/report', async (req, res) => {
  try {
    const result = await getReportAdmin()
    if (result.length === 0) {
      return res.status(404).json({ message: "No reports found" });
    }
    res.json(result)
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
})



router.get('/inspec', async (req, res) => {
  try {
    const result = await getInspection()
    if (result.length === 0) {
      return res.status(404).json({ message: "No Inspection found" })
    }
    res.json(result)
  } catch (error) {
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


router.post('/sendAssign', async (req, res) => {
  try {
    const { date, time, assign_by, report_id, insp_id, fire_id, description } = req.body;
    const result = await sendAssign({ date, time, assign_by, report_id, insp_id, fire_id, description });
    if (result.length === 0) {
      return res.status(404).json({ message: 'No fire extinguishers found' });
    }
    return res.status(200).json({ message: 'OK success', result });
  } catch (error) {
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
    const { inspection_id } = req.body;
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
    const result = await updatedStatus(fire_id);
    res.status(200).json({ message: "Status updated successfully", data: result });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/updatedStatusComplete", async (req, res) => {
  try {
    const { fire_id } = req.body;
    const result = await updatedStatusComplete(fire_id);
    res.status(200).json({ message: "Status updated successfully", data: result });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// เอาไว้ดึง user ให้เลือกตอน assign ที่หน้า inspection ของ admin
router.get('/getAllUserUser', async (req, res) => {
  try {
    const result = await getAllUserUser();
    if (result.length === 0) {
      return res.status(404).json({ message: 'No users with role User found' });
    }
    return res.status(200).json({ message: 'OK success', result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ดึง user จาก user_id
router.get('/getUserById/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await getUserById(user_id);
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'OK success', result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
})

// เปลี่ยนชื่อ เปลี่ยนรูป
router.put('/updatenameandimage/:user_id', upload.single('image'), async (req, res) => {
  const { user_id } = req.params;
  const { firstname, surname } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    const result = await editNameAndImage(firstname, surname, image, user_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'OK success'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router
