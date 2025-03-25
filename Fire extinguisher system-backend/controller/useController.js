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
const sql = `INSERT INTO users (username, password, email, firstName, surname, role, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`; // ใช้ NOW() แทนค่า NULL

export const addUser = async (userData) => {
  const { username, password, email, firstName, surname, role } = userData;
  const sql = `INSERT INTO Users (username, password, email, firstname, surname, role_id) 
                 VALUES (?, ?, ?, ?, ?, (SELECT role_id FROM Roles WHERE role_name = ?))`;
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
      const sql = 
        `SELECT 
          c.company_id, 
          c.company_name, 
          b.branch_name
        FROM 
          Companys c
        LEFT JOIN 
          Branchs b ON c.company_id = b.company_id
        LEFT JOIN 
          Fires f ON b.branch_id = f.branch_id
        ORDER BY 
          c.company_id, b.branch_name`;

      return await query(sql);
    } catch (error) {
      console.error("Error executing SQL query:", error.message);
      throw error;
    }
  };