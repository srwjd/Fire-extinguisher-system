import mysql from "mysql2/promise";

const config = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "fire_system"
};

// ฟังก์ชันสำหรับ execute SQL query
export const query = async (sql, params) => {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(sql, params);
    await connection.end();
    return rows;
}

// ดึงข้อมูลผู้ใช้ตาม username
export const getUserByUsername = async (username) => {
    const sql = `SELECT * 
    FROM Users RIGHT JOIN Roles ON Users.role_id = Roles.role_id
    WHERE username = ?`;
    const params = [username];
    return await query(sql, params);
}

// ดึงข้อมูลทั้งหมดจากตาราง Branchs
export const getAllBranches = async () => {
    const sql = "SELECT * FROM Branchs";
    return await query(sql);
}

// ดึงข้อมูลสาขาจาก branch_id
export const getBranchById = async (branchId) => {
    const sql = "SELECT * FROM Branchs WHERE branch_id = ?";
    const params = [branchId];
    return await query(sql, params);
}
