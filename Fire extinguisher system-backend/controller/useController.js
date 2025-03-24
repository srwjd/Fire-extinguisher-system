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
    const sql = `SELECT Users.*, Roles.roleName, Users.company_id
        FROM Users 
        RIGHT JOIN Roles ON Users.roleID = Roles.roleID
        WHERE Users.username = ?`;
    const params = [username];
    return await query(sql, params);
}



//ดูสาขาทั้งหมด
export const getAllBranchs = async () => {
    try{
        const sql = `SELECT * FROM Branchs`
        return await query(sql)
    }catch (error){
        console.error("Error fetching all branches:", error);
        throw error;
    }
}

//ดูสาขาตาม branch_id
export const getBranchById = async (branch_id) => {
    try{
        const sql = `SELECT * FROM Branchs
        WHERE branch_id = ?`
        const params = [branch_id]
        return await query(sql,params)
    }catch (error){
        console.error("Error fetching branch by ID:", error);
        throw error;
    }
}

//ดูสาขาย่อยตาม company_id
export const getBranchesByCompanyId = async (company_id) => {
    try{
        const sql = `SELECT * FROM Branchs WHERE company_id = ?`
        const params = [company_id]
        return await query(sql,params)
    }catch (error) {
        console.error("Error fetching Branchs by company ID:", error);
        throw error;
    }
}

//ดึงข้อมูลใน Fires ตาม branch_id
export const getFiresByBranchId = async (branch_id) => {
    try{
        const sql = `SELECT * FROM Fires WHERE branch_id =?`
        const params = [branch_id];
        return await query(sql,params)
    }catch (error){
        console.error("Error fetching fires by branch ID:", error);
        throw error;
    }
}

//ดึงข้อมูลใน Fires ตาม company_id
export const getFiresByCompanyId = async (company_id) => {
    try{
        const sql = `SELECT * FROM Fires WHERE company_id =?`
        const params = [company_id];
        return await query(sql,params)
    }catch (error){
        console.error("Error fetching fires by company ID:", error);
        throw error;
    }
}

//เพิ่มข้อมูลใน Report
export const addReport = async (report) => {
    try{
        const sql = `INSERT INTO Report (report_id, filename, description, date, fire_id, userID) VALUES (?, ?, ?, ?, ?)`
        const params = [report.report_id, report.filename, report.description, report.fire_id, report.report_date, report.report_status];
        return await query(sql,params)
    }catch (error){
        console.error("Error adding report:", error);
        throw error;
    }
}


export const getRoleCount = async () => {
    const sql = `
        SELECT r.roleName, COUNT(*) as count 
        FROM Users u
        JOIN Roles r ON u.roleID = r.roleID  -- เชื่อม Users.roleID กับ Roles.id
        GROUP BY u.roleID
    `;
    return await query(sql);
};


export const getAllCompaniesWithBranches = async () => {
    const sql = `
        SELECT 
            c.company_id, 
            c.company_name, 
            COUNT(b.branch_id) AS branch_count 
        FROM 
            Companys c
        LEFT JOIN 
            Branchs b ON c.company_id = b.company_id
        GROUP BY 
            c.company_id, c.company_name
    `;
    try {
        const result = await query(sql); // ดึงข้อมูลจากฐานข้อมูล
        return result;
    } catch (error) {
        console.error("Error executing SQL query:", error.message); // เพิ่มการพิมพ์ error
        throw error; // ส่งข้อผิดพลาดกลับ
    }
};






