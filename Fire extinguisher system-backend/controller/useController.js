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
    FROM MetthierUser RIGHT JOIN Roles ON MetthierUser.roleID = Roles.roleID
    WHERE username = ?`;
    const params = [username];
    return await query(sql, params);
}