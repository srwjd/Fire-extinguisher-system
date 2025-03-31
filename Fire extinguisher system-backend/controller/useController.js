import mysql from "mysql2/promise";

const config = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "fire_system",
};

export const query = async (sql, params) => {
  const connection = await mysql.createConnection(config);
  const [rows] = await connection.execute(sql, params);
  await connection.end();
  return rows;
};

export const getUserByUsername = async (username) => {
  const sql = `SELECT Users.*, Roles.role_name, Users.company_id
  FROM Users 
  LEFT JOIN Roles ON Users.role_id = Roles.role_id
  WHERE Users.username = ?`;
  const params = [username];
  return await query(sql, params);
}

// ดึงจำนวน User ใน Role
export const getUserCountByRole = async () => {
  const sql = `SELECT r.role_name, COUNT(*) as count 
        FROM Users u
        JOIN Roles r ON u.role_id = r.role_id  -- เชื่อม Users.role_id กับ Roles.id
        GROUP BY u.role_id`;
  return await query(sql);
};

// ดึงจำนวน Unit
export const getAllCompaniesWithBranches = async () => {
  const sql = `SELECT 
            c.company_id, 
            c.company_name, 
            COUNT(b.branch_id) AS branch_count 
        FROM 
            Companys c
        LEFT JOIN 
            Branchs b ON c.company_id = b.company_id
        GROUP BY 
            c.company_id, c.company_name`;
  try {
    const result = await query(sql); // ดึงข้อมูลจากฐานข้อมูล
    return result;
  } catch (error) {
    console.error("Error executing SQL query:", error.message); // เพิ่มการพิมพ์ error
    throw error; // ส่งข้อผิดพลาดกลับ
  }
};

// ดึงจำนวนถังดับเพลิงและสถานะมาโชว์
export const getFireExtinguishersByMonth = async () => {
  const sql = `
    SELECT 
      DATE_FORMAT(fire_mfd, '%Y-%m') AS month, 
      status,
      COUNT(*) AS count
    FROM Fires
    GROUP BY month, status
    ORDER BY month DESC;
  `;

  try {
    return await query(sql);
  } catch (error) {
    console.error("Error fetching fire extinguishers data:", error.message);
    throw error;
  }
};

// Manage User
export const getAllUser = async () => {
  try {
    const sql = `SELECT u.* , r.role_name
        FROM Users u
        JOIN Roles r ON u.role_id = r.role_id
        ORDER BY u.user_id`;
    return await query(sql);
  } catch (error) {
    console.error("Error executing SQL query:", error.message);
    throw error;
  }
};

// Add user
export const addUser = async (userData) => {
  const { username, password, email, firstName, surname, role } = userData;
  const sql = `INSERT INTO Users (username, password, email, firstname, surname, role_id, create_at) 
  VALUES (?, ?, ?, ?, ?, (SELECT role_id FROM Roles WHERE role_name = ?), NOW())`;
  const params = [username, password, email, firstName, surname, role];

  try {
    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error("Error inserting user:", error.message);
    throw error;
  }
};

// อัปเดตข้อมูล user
export const updateUser = async (userId, userData) => {
  const { username, email, firstName, surname, role } = userData;
  const sql = `UPDATE Users 
                 SET username = ?, email = ?, firstname = ?, surname = ?, 
                     role_id = (SELECT role_id FROM Roles WHERE role_name = ?)
                 WHERE user_id = ?`;
  const params = [username, email, firstName, surname, role, userId];

  try {
    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error("Error updating user:", error.message);
    throw error;
  }
};

// ลบ user
export const deleteUser = async (userId) => {
  const sql = `DELETE FROM Users WHERE user_id = ?`;
  const params = [userId];

  try {
    const result = await query(sql, params);
    return result;
  } catch (error) {
    console.error("Error deleting user:", error.message);
    throw error;
  }
};

// showAllUnit
export const getAllUnit = async () => {
  try {
    const sql = `
      SELECT Companys.company_id, 
      Companys.company_name, 
      Branchs.branch_id,
      Branchs.branch_name,
      COUNT(Fires.fire_id) AS fire_count
      FROM Companys
      LEFT JOIN Branchs ON Companys.company_id = Branchs.company_id
      LEFT JOIN Fires ON Branchs.branch_id = Fires.branch_id
      GROUP BY Companys.company_id, Branchs.branch_id
      `;
    return await query(sql);
  } catch (error) {
    console.error("Error executing SQL query:", error.message);
    throw error;
  }
};

// Add company and branch
import { v4 as uuidv4 } from "uuid"; // For generating unique serial_number

export const addCompany = async (userData) => {
  const { company_name, branch_name } = userData;

  try {
    // Step 1: Check if the company already exists
    const checkCompanysSql = `SELECT company_id FROM Companys WHERE company_name = ?`;
    const existingCompanys = await query(checkCompanysSql, [company_name]);

    let company_id;

    if (existingCompanys.length > 0) {
      // If company exists, use the existing company_id
      company_id = existingCompanys[0].company_id;
    } else {
      // If company doesn't exist, insert a new company and get its company_id
      const insertCompanysSql = `INSERT INTO Companys (company_name) VALUES (?)`;
      const result = await query(insertCompanysSql, [company_name]);
      company_id = result.insertId; // Get the newly created company_id
    }

    // Step 2: Check if the branch already exists
    const checkBranchSql = `SELECT branch_id FROM Branchs WHERE branch_name = ? AND company_id = ?`;
    const existingBranch = await query(checkBranchSql, [
      branch_name,
      company_id,
    ]);

    if (existingBranch.length > 0) {
      // If the branch already exists, return a message
      return {
        message: `Branch name "${branch_name}" already exists for this company.`,
        company_id,
      };
    } else {
      // If the branch doesn't exist, insert the new branch
      const insertBranchSql = `INSERT INTO Branchs (company_id, branch_name) VALUES (?, ?)`;
      const branchResult = await query(insertBranchSql, [
        company_id,
        branch_name,
      ]);
      const branch_id = branchResult.insertId; // Get the newly created branch_id

      // Step 3: Insert 5 fire extinguishers with auto-generated serial numbers
      const fireInsertPromises = [];
      const insertDate = new Date().toISOString().split("T")[0]; // วันที่ปัจจุบัน (YYYY-MM-DD)

      // คำนวณวันหมดอายุ (fire_exp) = fire_mfd + 10 ปี
      const expireDate = new Date();
      expireDate.setFullYear(expireDate.getFullYear() + 10);
      const fire_exp = expireDate.toISOString().split("T")[0]; // แปลงเป็น YYYY-MM-DD

      // คำนวณ latest_check = fire_mfd และ next_check = latest_check + 3 เดือน
      const latestCheck = insertDate;
      const nextCheckDate = new Date();
      nextCheckDate.setMonth(nextCheckDate.getMonth() + 3);
      const nextCheck = nextCheckDate.toISOString().split("T")[0];

      for (let i = 0; i < 5; i++) {
        const serial_number = uuidv4();
        const insertFireSql = `
          INSERT INTO Fires (serial_number, fire_mfd, fire_exp, latest_check, next_check, company_id, branch_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        fireInsertPromises.push(
          query(insertFireSql, [
            serial_number,
            insertDate,
            fire_exp,
            latestCheck,
            nextCheck,
            company_id,
            branch_id,
          ])
        );
      }

      await Promise.all(fireInsertPromises);

      return {
        message:
          "Company and branch added successfully, along with 5 fire extinguishers.",
        company_id,
        branch_id,
        fire_count: 5, // Return the number of fire extinguishers added
      };
    }
  } catch (error) {
    console.error("Error inserting company or branch:", error.message);
    throw new Error("Failed to insert company or branch. " + error.message);
  }
};

// Edit company and branch
export const editCompany = async (company_id, branch_id, newCompanyData) => {
  const { branch_name } = newCompanyData;

  if (!branch_name) {
    throw new Error("Branch name must be provided.");
  }

  console.log("Parameters received:", { company_id, branch_id, branch_name });

  try {
    const updateBranchSql = `UPDATE Branchs SET branch_name = ? WHERE company_id = ? AND branch_id = ?`;
    const result = await query(updateBranchSql, [branch_name, company_id, branch_id]);

    if (result.affectedRows === 0) {
      throw new Error("No rows affected. Possibly, the branch doesn't exist.");
    }

    return {
      message: "Branch name updated successfully",
      company_id,
      branch_id,
      new_branch_name: branch_name,
    };
  } catch (error) {
    console.error("Error updating branch:", error.message);
    throw new Error("Failed to update branch. " + error.message);
  }
};

// ลบ Branch และ Fire extinguishers ที่เกี่ยวข้อง
export const deleteBranchAndFires = async (branch_id) => {
  try {
    // Step 1: Delete fires associated with the branch
    const deleteFiresSql = `DELETE FROM Fires WHERE branch_id = ?`;
    await query(deleteFiresSql, [branch_id]);

    // Step 2: Delete the branch itself
    const deleteBranchSql = `DELETE FROM Branchs WHERE branch_id = ?`;
    const result = await query(deleteBranchSql, [branch_id]);

    if (result.affectedRows === 0) {
      throw new Error("No branch found with the given ID.");
    }

    return {
      message: "Branch and associated fire extinguishers deleted successfully.",
      branch_id,
    };
  } catch (error) {
    console.error("Error deleting branch and fire extinguishers:", error.message);
    throw new Error("Failed to delete branch and extinguishers. " + error.message);
  }
};

//ดูสาขาทั้งหมด
export const getAllBranchs = async () => {
  try {
    const sql = `SELECT * FROM Branchs`
    return await query(sql)
  } catch (error) {
    console.error("Error fetching all branches:", error);
    throw error;
  }
}

//ดูสาขาตาม branch_id
export const getBranchById = async (branch_id) => {
  try {
    const sql = `SELECT * FROM Branchs
        WHERE branch_id = ?`
    const params = [branch_id]
    return await query(sql, params)
  } catch (error) {
    console.error("Error fetching branch by ID:", error);
    throw error;
  }
}

//ดูสาขาย่อยตาม company_id
export const getBranchesByCompanyId = async (company_id) => {
  try {
    const sql = `SELECT * FROM Branchs WHERE company_id = ?`
    const params = [company_id]
    return await query(sql, params)
  } catch (error) {
    console.error("Error fetching Branchs by company ID:", error);
    throw error;
  }
}

//ดึงข้อมูลใน Fires ตาม branch_id
export const getFiresByBranchId = async (branch_id) => {
  try {
    const sql = `SELECT * FROM Fires WHERE branch_id =?`
    const params = [branch_id];
    return await query(sql, params)
  } catch (error) {
    console.error("Error fetching fires by branch ID:", error);
    throw error;
  }
}

//ดึงข้อมูลใน Fires ตาม company_id
export const getFiresByCompanyId = async (company_id) => {
  try {
    const sql = `SELECT * FROM Fires WHERE company_id =?`
    const params = [company_id];
    return await query(sql, params)
  } catch (error) {
    console.error("Error fetching fires by company ID:", error);
    throw error;
  }
}

//เพิ่มข้อมูลใน Report
export const addReport = async (report) => {
  try {
    // 🔹 เพิ่ม Report ลงในตาราง Reports
    const sqlInsert = `
            INSERT INTO Reports (filename, description, date, time, fire_id, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    const paramsInsert = [report.filename, report.description, report.date, report.time, report.fire_id, report.user_id];
    await query(sqlInsert, paramsInsert);

    // 🔹 อัปเดตสถานะของ Fire เป็น "report"
    const sqlUpdate = `UPDATE Fires SET status = 'report' WHERE fire_id = ?`;
    await query(sqlUpdate, [report.fire_id]);

    return { success: true, message: "Report added and fire status updated successfully" };
  } catch (error) {
    console.error("Error adding report:", error);
    throw error;
  }
};


// ดึง Report ตาม report_id
export const getReportById = async (report_id) => {
  try {
    const sql = `SELECT * FROM Reports WHERE report_id =?`
    const params = [report_id];
    return await query(sql, params)
  } catch (error) {
    console.error("Error get report by report_id:", error);
    throw error;
  }
}
// ดึงข้อมูลใน Fires ตาม fire_id
export const getFiresById = async (fire_id) => {
  try {
    const sql = `SELECT * FROM Fires WHERE fire_id =?`
    const params = [fire_id];
    return await query(sql, params)
  } catch (error) {
    console.error("Error get fire by fire_id:", error);
    throw error;
  }
}
// sirawan
export const getReport = async (insp_id) => {
  const sql = `
              SELECT *
              FROM Assigns RIGHT JOIN Reports ON Assigns.report_id = Reports.report_id
              WHERE Assigns.insp_id = ?
              `;
  const params = [insp_id];
  return await query(sql, params);
}


export const getFiresByIds = async (fire_ids) => {
  if (!Array.isArray(fire_ids) || fire_ids.length === 0) {
      throw new Error("fire_ids ต้องเป็นอาเรย์และมีค่าอย่างน้อย 1 ค่า");
  }

  // 🔥 ใช้ Dynamic Query แทน `IN (?)` เพื่อรองรับอาร์เรย์หลายค่า
  const placeholders = fire_ids.map(() => "?").join(",");
  const sql = `
      SELECT * 
      FROM Fires 
      LEFT JOIN Companys ON Fires.company_id = Companys.company_id
      LEFT JOIN Branchs ON Fires.branch_id = Branchs.branch_id
      WHERE fire_id IN (${placeholders})`;

  return await query(sql, fire_ids);
};

export const insertInspection = async (data) => {
  try {
      // ไม่ต้องรวม inspection_id ในคำสั่ง SQL
      const sql = `INSERT INTO Inspections 
      (filename, description, date, time, fire_id, user_id, assign_id, condition_ok, pressure_ok, nozzle_clear, pin_sealed, placement_correct) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [data.filename, data.description, data.date, data.time, data.fire_id, data.user_id, data.assign_id, data.condition_ok, data.pressure_ok, data.nozzle_clear, data.pin_sealed, data.placement_correct];
      return await query(sql, params);
  } catch (error) {
      console.error("Error occurred while inserting inspection:", error);
  }
}

export const updateStatus = async (data) => {
  try {
      const sql = `UPDATE Fires SET status = 'process' WHERE fire_id = ?`;
      const params = [data.fire_id];
      return await query(sql, params);
  } catch (error) {
      console.error("Error occurred while updating status:", error);
  }
}







