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
        RIGHT JOIN Roles ON Users.role_id = Roles.role_id
        WHERE Users.username = ?`;
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
    LEFT JOIN Users ON Inspections.user_id = Users.user_id
    ORDER BY Inspections.inspection_id`
    return await query(sql)
}


export const getAssign = async () => {
    const sql = 
                `SELECT * , Assigns.time
                FROM Assigns
                LEFT JOIN Reports ON Assigns.report_id = Reports.report_id
                LEFT JOIN Fires ON Reports.fire_id = Fires.fire_id
                LEFT JOIN Users ON Assigns.insp_id = Users.user_id
                ORDER BY Assigns.assign_id
                `
    return await query(sql);
}

export const sendAssign = async (assign) => {
    try {
        const sql = `
        INSERT INTO Assigns (date, time, assign_by, report_id, insp_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const params = [assign.date, assign.time, assign.assign_by, assign.report_id, assign.insp_id];
    return await query(sql, params);
    }catch (error) {
        console.error("Error adding report:", error);
        throw error;
    }
}


 export const getFire = async () => {
    const sql = `SELECT * FROM Fires
    ORDER BY Fires.fire_id;`
    return await query(sql);
 }

 export const fireUpdateStatus = async (data) => {
    try {
       const sql = `UPDATE Fires SET status = ? WHERE fire_id = ?`;
       const params = [data.status, data.fire_id];
       console.log("Executing SQL:", sql);
       return await query(sql, params);
    } catch (error) {
       console.error(error);
       throw error;
    }
 };

 export const sendReports = async (report) => {
    try {
      const sqlInsert = `
        INSERT INTO Reports (filename, description, date, time, fire_id, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const paramsInsert = [report.filename, report.description, report.date, report.time, report.fire_id, report.user_id];
      
      // ใช้ query และรับผลลัพธ์
      const result = await query(sqlInsert, paramsInsert);
  
      // ตรวจสอบว่าผลลัพธ์ที่ได้มี insertId หรือไม่
      console.log("Insert result: ", result);
  
      // ตรวจสอบว่า result มี insertId หรือไม่
      if (result && result.insertId) {
        console.log("Inserted Report ID: ", result.insertId);
      } else {
        console.error("No insertId returned from MySQL query.");
      }
  
      // อัปเดตสถานะของ Fire เป็น "report"
      const sqlUpdate = `UPDATE Fires SET status = 'report' WHERE fire_id = ?`;
      await query(sqlUpdate, [report.fire_id]);
  
      return { success: true, message: "Report added and fire status updated successfully", data: result };
    } catch (error) {
      console.error("Error adding report:", error);
      throw error;
    }
  };


 export const deleteProcess = async (inspection_id) => {
    try {
      const sql = `DELETE FROM Inspections WHERE Inspection_id = ?`;
      const params = [inspection_id];
      await query(sql, params);
      return { success: true, message: "Report deleted successfully" };
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  };


  export const updatedStatus = async (fire_id) => {
    try {
      const sql = `UPDATE Fires SET status = 'report' WHERE fire_id = ?`;
      const params = [fire_id];
      await query(sql, params);
      return { success: true, message: "Status updated successfully" };
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }


  export const updatedStatusComplete = async (fire_id) => {
    try {
      const sql = `UPDATE Fires SET status = 'complete' WHERE fire_id = ?`;
      const params = [fire_id];
      await query(sql, params);
      return { success: true, message: "Status updated successfully" };
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }
