import mysql from "mysql2/promise";

const config = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "fire_system"
};

export const query = async (sql, params) => {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(sql, params);
    await connection.end();
    return rows;
}

export const getUserByUsername = async (username) => {
    const sql = `SELECT * 
    FROM Users RIGHT JOIN Roles ON Users.roleID = Roles.roleID
    WHERE username = ?`;
    const params = [username];
    return await query(sql, params);
}

// ดึงจำนวน User ใน Role
export const getUserCountByRole = async () => {
    const sql = 
        `SELECT r.roleName, COUNT(*) as count 
        FROM Users u
        JOIN Roles r ON u.roleID = r.roleID  -- เชื่อม Users.roleID กับ Roles.id
        GROUP BY u.roleID`
    ;
    return await query(sql);
};

// ดึงจำนวน Unit
export const getAllCompaniesWithBranches = async () => {
    const sql = 
        `SELECT 
            c.company_id, 
            c.company_name, 
            COUNT(b.branch_id) AS branch_count 
        FROM 
            Companys c
        LEFT JOIN 
            Branchs b ON c.company_id = b.company_id
        GROUP BY 
            c.company_id, c.company_name`
    ;
    try {
        const result = await query(sql); // ดึงข้อมูลจากฐานข้อมูล
        return result;
    } catch (error) {
        console.error("Error executing SQL query:", error.message); // เพิ่มการพิมพ์ error
        throw error; // ส่งข้อผิดพลาดกลับ
    }
};