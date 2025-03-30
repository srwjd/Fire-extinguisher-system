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
    const sql = `SELECT Users.*, Roles.role_name, Users.company_id
        FROM Users 
        LEFT JOIN Roles ON Users.role_id = Roles.role_id
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
    try{
        const sql = `SELECT * FROM Reports WHERE report_id =?`
        const params = [report_id];
        return await query(sql,params)
    }catch (error){
        console.error("Error get report by report_id:", error);
        throw error;
    }
}



// ดึงข้อมูลใน Fires ตาม fire_id
export const getFiresById = async (fire_id) => {
    try{
        const sql = `SELECT * FROM Fires WHERE fire_id =?`
        const params = [fire_id];
        return await query(sql,params)
    }catch (error){
        console.error("Error get fire by fire_id:", error);
        throw error;
    }
}








