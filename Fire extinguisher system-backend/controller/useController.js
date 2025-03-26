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

export const getReport = async () => {
    const sql = `SELECT * FROM Reports
    LEFT JOIN Fires ON Reports.fire_id = Fires.fire_id
    ORDER BY Reports.report_id;`

    return await query(sql);
}

export const getInspection = async () => {
    const sql =`SELECT * FROM Inspections
    LEFT JOIN Fires ON Inspections.fire_id = Fires.fire_id
    ORDER BY Inspections.inspection_id`
    return await query(sql)
}


export const getAssign = async () => {
    const sql = 
                `SELECT * , Assigns.time
                FROM Assigns
                LEFT JOIN Reports ON Assigns.report_id = Reports.report_id
                LEFT JOIN Fires ON Reports.fire_id = Fires.fire_id
                `
    return await query(sql);
}