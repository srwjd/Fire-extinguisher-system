import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  getUserByUsername,
  getUserCountByRole,
  getAllCompaniesWithBranches,
  getAllUser,
  addUser,
  updateUser,
  deleteUser,
  getAllUnit,
  addCompany,
  editCompany,
  deleteBranchAndFires,
} from "../controller/useController.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await getUserByUsername(username);
    if (result.length === 0) {
      return res.status(400).json({ message: "not found" });
    }
    // const match = await bcrypt.compare(password, result[0].password);
    const match = password === result[0].password;
    if (!match) {
      return res.status(400).json({ message: "not found" });
    }
    // const token = await jwt.sign({ id: result[0].id }, jwt_secret, { expiresIn: '1h' });
    const token = jwt.sign({ id: result[0].id }, "secret", { expiresIn: "1h" });
    const role = result[0].role_name;
    return res.status(200).json({ message: "OK success", token, role });
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
  res.status(200).json({ token: "token" });
});

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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message }); // ส่งข้อผิดพลาดพร้อมรายละเอียด
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
    onsole.error("Error fetching companies:", error.message); // เพิ่มการพิมพ์ error
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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// อัปเดตข้อมูลผู้ใช้
router.put("/updateUser/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await updateUser(userId, req.body);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made" });
    }
    res.status(200).json({ message: "User updated successfully", result });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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
    const { company_name, branch_name } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วน
    if (!company_name || !branch_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // เรียกใช้ฟังก์ชัน addCompany
    const result = await addCompany({ company_name, branch_name });

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

export default router;
