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
        SELECT 
          c.company_id, 
          c.company_name, 
          b.branch_name,
          COUNT(f.fire_id) AS quantity  -- Counting the number of fire extinguishers for each branch
        FROM 
          Companys c
        LEFT JOIN 
          Branchs b ON c.company_id = b.company_id
        LEFT JOIN 
          Fires f ON b.branch_id = f.branch_id
        GROUP BY 
          c.company_id, b.branch_name
        ORDER BY 
          c.company_id, b.branch_name
      `;
    return await query(sql);
  } catch (error) {
    console.error("Error executing SQL query:", error.message);
    throw error;
  }
};

// Add company and branch
export const addCompany = async (userData) => {
  const { company_name, branch_name } = userData;

  try {
    // ตรวจสอบว่า company_name มีอยู่ในตาราง Companys แล้วหรือยัง
    const checkCompanysSql = `SELECT company_id FROM Companys WHERE company_name = ?`;
    const existingCompanys = await query(checkCompanysSql, [company_name]);

    let company_id;

    if (existingCompanys.length > 0) {
      // ถ้ามีอยู่แล้วให้ใช้ company_id เดิม
      company_id = existingCompanys[0].company_id;
    } else {
      // ถ้ายังไม่มี ให้เพิ่มบริษัทใหม่และรับ company_id ที่สร้างขึ้น
      const insertCompanysSql = `INSERT INTO Companys (company_name) VALUES (?)`;
      const result = await query(insertCompanysSql, [company_name]);
      company_id = result.insertId; // ดึง company_id ที่เพิ่มใหม่
    }

    // เช็คว่า branch_name มีอยู่ในตาราง Branchs หรือยัง
    const checkBranchSql = `SELECT branch_id FROM Branchs WHERE branch_name = ? AND company_id = ?`;
    const existingBranch = await query(checkBranchSql, [
      branch_name,
      company_id,
    ]);

    if (existingBranch.length > 0) {
      // ถ้ามี branch_name นี้แล้ว แจ้งเตือน
      return {
        message: `Branch name "${branch_name}" already exists for this company.`,
        company_id,
      };
    } else {
      // ถ้าไม่มี branch_name นี้ ให้เพิ่มเข้าไป
      const insertBranchSql = `INSERT INTO Branchs (company_id, branch_name) VALUES (?, ?)`;
      await query(insertBranchSql, [company_id, branch_name]);
    }

    return {
      message: "Company and branch added successfully",
      company_id,
    };
  } catch (error) {
    console.error("Error inserting company or branch:", error.message);
    throw new Error("Failed to insert company or branch. " + error.message);
  }
};
