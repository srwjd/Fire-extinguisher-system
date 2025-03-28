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
  const sql = `SELECT * 
    FROM Users RIGHT JOIN Roles ON Users.role_id = Roles.role_id
    WHERE username = ?`;
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
      LEFT JOIN Fires ON Companys.company_id = Fires.company_id
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

// Delete company and branch

