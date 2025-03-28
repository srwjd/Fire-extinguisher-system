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
    FROM Users RIGHT JOIN Roles ON Users.role_id = Roles.role_id
    WHERE username = ?`;
    const params = [username];
    return await query(sql, params);
}

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

export const getUnit = async () => {
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
        console.error("Error occurred while getting units:", error);
    }
}