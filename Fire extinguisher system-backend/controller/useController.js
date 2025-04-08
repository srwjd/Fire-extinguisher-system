import mysql from "mysql2/promise";

const config = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "fire_system",
};

// ฟังก์ชันสำหรับ execute SQL query
export const query = async (sql, params) => {
  const connection = await mysql.createConnection(config);
  const [rows] = await connection.execute(sql, params);
  await connection.end();
  return rows;
};

// ดึงข้อมูลผู้ใช้ตาม username
export const getUserByUsername = async (username) => {
  const sql = `SELECT Users.*, Roles.role_name
  FROM Users 
  LEFT JOIN Roles ON Users.role_id = Roles.role_id
  LEFT JOIN Branchs ON Users.branch_id = Branchs.branch_id
  WHERE Users.username = ?`;
  const params = [username];
  return await query(sql, params);
};

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
  const sql = `SELECT c.company_id, c.company_name, COUNT(b.branch_id) AS branch_count 
        FROM Companys c
        LEFT JOIN Branchs b ON c.company_id = b.company_id
        GROUP BY c.company_id, c.company_name`;
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
      month,
      status,
      COUNT(*) AS count
    FROM (
      SELECT 
        DATE_FORMAT(fire_mfd, '%Y-%b') AS month,
        status
      FROM Fires
      WHERE fire_mfd IS NOT NULL
    ) AS sub
    GROUP BY month, status
    ORDER BY STR_TO_DATE(month, '%Y-%b') ASC;
  `;

  console.log("Running SQL:", sql);

  try {
    return await query(sql);
  } catch (error) {
    console.error("🔥 Error executing query:", error.message);
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

// ดึง company_id จาก branch_id ที่เลือก
export const getCompanyIdByBranch = async (branchId) => {
  const sql = `SELECT company_id FROM Branchs WHERE branch_id = ?`;
  const params = [branchId];

  try {
    const result = await query(sql, params);
    return result.length > 0 ? result[0].company_id : null; // คืนค่า company_id ที่สังกัด
  } catch (error) {
    console.error("Error fetching company_id by branch_id:", error.message);
    throw error;
  }
};

export const addUser = async (userData) => {
  const {
    username,
    password,
    email,
    firstName,
    surname,
    role,
    company_id,
    branch_id,
  } = userData;

  const sql = `INSERT INTO Users (username, password, email, firstname, surname, role_id, company_id, branch_id, create_at)
             VALUES (?, ?, ?, ?, ?, (SELECT role_id FROM Roles WHERE role_name = ?), ?, ?, NOW())`;
  const params = [
    username,
    password,
    email,
    firstName,
    surname,
    role,
    company_id || null,
    branch_id || null,
  ];

  try {
    return await query(sql, params);
  } catch (error) {
    console.error("Error executing SQL query:", error.message);
  }
};

// export const addUser = async (userData) => {
//   const {
//     username,
//     password,
//     email,
//     firstName,
//     surname,
//     role,
//     company_id,
//     branch_id,
//   } = userData;

//   let sql;
//   let params;

//   // เช็คว่าเลือก role เป็น Main Branch หรือ Sub Branch
//   if (role === "MainBranch") {
//     // สำหรับ Main Branch เก็บแค่ company_id
//     sql = `INSERT INTO Users (username, password, email, firstname, surname, role_id, company_id, create_at)
//            VALUES (?, ?, ?, ?, ?, (SELECT role_id FROM Roles WHERE role_name = ?), ?, NOW())`;
//     params = [username, password, email, firstName, surname, role, company_id];
//   } else if (role === "SubBranch") {
//     // สำหรับ Sub Branch ให้ดึง company_id ที่สังกัดอยู่กับ branch_id
//     const companyId = await getCompanyIdByBranch(branch_id); // ดึง company_id จาก branch_id

//     if (!companyId) {
//       throw new Error("Branch does not belong to any company.");
//     }

//     // สำหรับ Sub Branch เก็บแค่ branch_id และ company_id ที่ดึงมา
//     sql = `INSERT INTO Users (username, password, email, firstname, surname, role_id, company_id, branch_id, create_at)
//            VALUES (?, ?, ?, ?, ?, (SELECT role_id FROM Roles WHERE role_name = ?), ?, ?, NOW())`;
//     params = [
//       username,
//       password,
//       email,
//       firstName,
//       surname,
//       role,
//       companyId,
//       branch_id,
//     ];
//   }

//   try {
//     const result = await query(sql, params);
//     return result;
//   } catch (error) {
//     console.error("Error inserting user:", error.message);
//     throw error;
//   }
// };

// อัปเดตข้อมูล user
export const updateUser = async (userId, userData) => {
  const { username, email, firstName, surname, role, company_id, branch_id } =
    userData;

  let sql = `UPDATE Users 
             SET username = ?, email = ?, firstname = ?, surname = ?, 
                 role_id = (SELECT role_id FROM Roles WHERE role_name = ?),`;

  // เพิ่มการอัพเดต company_id หรือ branch_id ถ้าเป็น MainBranch หรือ SubBranch
  if (role === "MainBranch") {
    sql += ` company_id = ? `;
  } else if (role === "SubBranch") {
    sql += ` branch_id = ? `;
  }

  sql += `WHERE user_id = ?`;

  const params =
    role === "MainBranch"
      ? [username, email, firstName, surname, role, company_id, userId]
      : role === "SubBranch"
      ? [username, email, firstName, surname, role, branch_id, userId]
      : [username, email, firstName, surname, role, userId];

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
export const addCompany = async (userData) => {
  const { company_name, branch_name, quantity } = userData;

  try {
    // Step 1: Check if the company already exists
    const checkCompanysSql = `SELECT company_id FROM Companys WHERE company_name = ?`;
    const existingCompanys = await query(checkCompanysSql, [company_name]);

    let company_id;

    if (existingCompanys.length > 0) {
      company_id = existingCompanys[0].company_id;
    } else {
      const insertCompanysSql = `INSERT INTO Companys (company_name) VALUES (?)`;
      const result = await query(insertCompanysSql, [company_name]);
      company_id = result.insertId;
    }

    // Step 2: Check if the branch already exists
    const checkBranchSql = `SELECT branch_id FROM Branchs WHERE branch_name = ? AND company_id = ?`;
    const existingBranch = await query(checkBranchSql, [branch_name, company_id]);

    if (existingBranch.length > 0) {
      return {
        message: `Branch name "${branch_name}" already exists for this company.`,
        company_id,
      };
    } else {
      const insertBranchSql = `INSERT INTO Branchs (company_id, branch_name) VALUES (?, ?)`;
      const branchResult = await query(insertBranchSql, [company_id, branch_name]);
      const branch_id = branchResult.insertId;

      // Step 3: Generate serial numbers
      const getLastSerialSql = `
      SELECT serial_number FROM Fires 
      WHERE serial_number LIKE 'NFPA 10-%' 
      ORDER BY fire_id DESC 
      LIMIT 1
    `;
      const lastSerialResult = await query(getLastSerialSql);
      let lastNumber = 0;

      if (lastSerialResult.length > 0) {
        const lastSerial = lastSerialResult[0].serial_number;
        const match = lastSerial.match(/NFPA 10-(\d+)/);
        if (match) {
          lastNumber = parseInt(match[1], 10);
        }
      }

      const fireInsertPromises = [];
      const insertDate = new Date().toISOString().split("T")[0];

      const expireDate = new Date();
      expireDate.setFullYear(expireDate.getFullYear() + 10);
      const fire_exp = expireDate.toISOString().split("T")[0];

      const latestCheck = insertDate;
      const nextCheckDate = new Date();
      nextCheckDate.setMonth(nextCheckDate.getMonth() + 3);
      const nextCheck = nextCheckDate.toISOString().split("T")[0];

      for (let i = 1; i <= quantity; i++) {
        const newNumber = (lastNumber + i).toString().padStart(4, "0");
        const serial_number = `NFPA 10-${newNumber}`;

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
        message: "Company and branch added successfully, along with 5 fire extinguishers.",
        company_id,
        branch_id,
        fire_count: quantity,
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
    const result = await query(updateBranchSql, [
      branch_name,
      company_id,
      branch_id,
    ]);

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
    console.error(
      "Error deleting branch and fire extinguishers:",
      error.message
    );
    throw new Error(
      "Failed to delete branch and extinguishers. " + error.message
    );
  }
};

//ดูสาขาทั้งหมด
export const getAllBranchs = async () => {
  try {
    const sql = `SELECT * FROM Branchs`;
    return await query(sql);
  } catch (error) {
    console.error("Error fetching all branches:", error);
    throw error;
  }
};

//ดูสาขาตาม branch_id
export const getBranchById = async (branch_id) => {
  try {
    const sql = `SELECT * FROM Branchs
        WHERE branch_id = ?`;
    const params = [branch_id];
    return await query(sql, params);
  } catch (error) {
    console.error("Error fetching branch by ID:", error);
    throw error;
  }
};

export const getAllCompanys = async () => {
  const sql = "SELECT * FROM Companys";
  return await query(sql);
};

export const getAllBranches = async () => {
  const sql = "SELECT * FROM Branchs";
  return await query(sql);
};

//ดูสาขาย่อยตาม company_id
export const getBranchesByCompanyId = async (company_id) => {
  try {
    const sql = `SELECT * FROM Branchs WHERE company_id = ?`;
    const params = [company_id];
    return await query(sql, params);
  } catch (error) {
    console.error("Error fetching Branchs by company ID:", error);
    throw error;
  }
};

//ดึงข้อมูลใน Fires ตาม branch_id
export const getFiresByBranchId = async (branch_id) => {
  try {
    const sql = `SELECT * FROM Fires WHERE branch_id =?`;
    const params = [branch_id];
    return await query(sql, params);
  } catch (error) {
    console.error("Error fetching fires by branch ID:", error);
    throw error;
  }
};

//ดึงข้อมูลใน Fires ตาม company_id
export const getFiresByCompanyId = async (company_id) => {
  try {
    const sql = `SELECT * FROM Fires WHERE company_id =?`;
    const params = [company_id];
    return await query(sql, params);
  } catch (error) {
    console.error("Error fetching fires by company ID:", error);
    throw error;
  }
};

//เพิ่มข้อมูลใน Report
export const addReport = async (report) => {
  try {
    // 🔹 เพิ่ม Report ลงในตาราง Reports
    const sqlInsert = `
            INSERT INTO Reports (filename, description, date, time, fire_id, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    const paramsInsert = [
      report.filename,
      report.description,
      report.date,
      report.time,
      report.fire_id,
      report.user_id,
    ];
    await query(sqlInsert, paramsInsert);

    // 🔹 อัปเดตสถานะของ Fire เป็น "report"
    const sqlUpdate = `UPDATE Fires SET status = 'report' WHERE fire_id = ?`;
    await query(sqlUpdate, [report.fire_id]);

    return {
      success: true,
      message: "Report added and fire status updated successfully",
    };
  } catch (error) {
    console.error("Error adding report:", error);
    throw error;
  }
};

// ดึง Report ตาม report_id
export const getReportById = async (report_id) => {
  try {
    const sql = `SELECT * FROM Reports WHERE report_id =?`;
    const params = [report_id];
    return await query(sql, params);
  } catch (error) {
    console.error("Error get report by report_id:", error);
    throw error;
  }
};
// ดึงข้อมูลใน Fires ตาม fire_id
export const getFiresById = async (fire_id) => {
  try {
    const sql = `SELECT * FROM Fires WHERE fire_id =?`;
    const params = [fire_id];
    return await query(sql, params);
  } catch (error) {
    console.error("Error get fire by fire_id:", error);
    throw error;
  }
};
// sirawan
export const getReport = async (insp_id) => {
  const sql = `
              SELECT *
              FROM Assigns RIGHT JOIN Reports ON Assigns.report_id = Reports.report_id
              WHERE Assigns.insp_id = ?
              `;
  const params = [insp_id];
  return await query(sql, params);
};

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
    const params = [
      data.filename,
      data.description,
      data.date,
      data.time,
      data.fire_id,
      data.user_id,
      data.assign_id,
      data.condition_ok,
      data.pressure_ok,
      data.nozzle_clear,
      data.pin_sealed,
      data.placement_correct,
    ];
    return await query(sql, params);
  } catch (error) {
    console.error("Error occurred while inserting inspection:", error);
  }
};

export const updateStatus = async (data) => {
  try {
    const sql = `UPDATE Fires SET status = 'process' WHERE fire_id = ?`;
    const params = [data.fire_id];
    return await query(sql, params);
  } catch (error) {
    console.error("Error occurred while updating status:", error);
  }
};

export const getReportAdmin = async () => {
  const sql = `SELECT * FROM Reports
    LEFT JOIN Fires ON Reports.fire_id = Fires.fire_id
    ORDER BY Reports.report_id;`;

  return await query(sql);
};

export const getInspection = async () => {
  const sql = `SELECT * FROM Inspections
    LEFT JOIN Fires ON Inspections.fire_id = Fires.fire_id
    LEFT JOIN Users ON Inspections.user_id = Users.user_id
    ORDER BY Inspections.inspection_id`;
  return await query(sql);
};

export const getAssign = async () => {
  const sql = `SELECT * , Assigns.time
                FROM Assigns
                LEFT JOIN Reports ON Assigns.report_id = Reports.report_id
                LEFT JOIN Fires ON Reports.fire_id = Fires.fire_id
                LEFT JOIN Users ON Assigns.insp_id = Users.user_id
                ORDER BY Assigns.assign_id
                `;
  return await query(sql);
};

export const sendAssign = async (assign) => {
  try {
    const sql = `
        INSERT INTO Assigns (date, time, assign_by, report_id, insp_id, fire_id, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      assign.date,
      assign.time,
      assign.assign_by,
      assign.report_id,
      assign.insp_id,
      assign.fire_id,
      assign.description,
    ];
    const result = await query(sql, params);

    const sqlUpdate = `UPDATE Fires SET status = 'report' WHERE fire_id = ?`;
    const paramsUpdate = [assign.fire_id];
    await query(sqlUpdate, paramsUpdate);

    return result;

  } catch (error) {
    console.error("Error adding report:", error);
    throw error;
  }
};

export const getFire = async () => {
  const sql = `SELECT * FROM Fires
    ORDER BY Fires.fire_id;`;
  return await query(sql);
};

export const fireUpdateStatus = async (data) => {
  try {
    const sql = `UPDATE Fires SET status = ? WHERE fire_id = ?`;
    const params = [data.status, data.fire_id];
    console.log("Executing SQL:", sql);
    return await query(sql, params);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const sendReports = async (report) => {
  try {
    const sqlInsert = `
        INSERT INTO Reports (filename, description, date, time, fire_id, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
    const paramsInsert = [
      report.filename,
      report.description,
      report.date,
      report.time,
      report.fire_id,
      report.user_id,
    ];

    // ใช้ query และรับผลลัพธ์
    const result = await query(sqlInsert, paramsInsert);

    // ตรวจสอบว่าผลลัพธ์ที่ได้มี insertId หรือไม่
    console.log("Insert result: ", result);

    // ตรวจสอบว่า result มี insertId หรือไม่
    if (result && result.insertId) {
      console.log("Inserted Report ID: ", result.insertId);
    } else {
      console.error("No insertId returned from MySQL query.");
    }

    // อัปเดตสถานะของ Fire เป็น "report"
    const sqlUpdate = `UPDATE Fires SET status = 'report' WHERE fire_id = ?`;
    await query(sqlUpdate, [report.fire_id]);

    return {
      success: true,
      message: "Report added and fire status updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error adding report:", error);
    throw error;
  }
};

export const deleteProcess = async (inspection_id) => {
  try {
    const sql = `DELETE FROM Inspections WHERE Inspection_id = ?`;
    const params = [inspection_id];
    await query(sql, params);
    return { success: true, message: "Report deleted successfully" };
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};

export const updatedStatus = async (fire_id) => {
  try {
    const sql = `UPDATE Fires SET status = 'report' WHERE fire_id = ?`;
    const params = [fire_id];
    await query(sql, params);
    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

export const updatedStatusComplete = async (fire_id) => {
  try {
    const sql = `UPDATE Fires SET status = 'complete' WHERE fire_id = ?`;
    const params = [fire_id];
    await query(sql, params);
    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

// เอาไว้ดึง user ให้เลือกตอน assign ที่หน้า inspection ของ admin
export const getAllUserUser = async () => {
  try {
    const sql = `SELECT u.user_id, u.username
                FROM Users u
                JOIN Roles r ON u.role_id = r.role_id
                WHERE r.role_name = 'User'
                ORDER BY u.username`;
    return await query(sql);
  } catch (error) {
    console.error("Error executing SQL query:", error.message);
    throw error;
  }
};