import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { GoChecklist } from "react-icons/go";
import "./Inspection.css";

function Inspection() {
  const [inspectionData, setInspectionData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReport, setFilteredReport] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [assignUser, setAssignUser] = useState("");
  const [users, setUsers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReport.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/fire/getAllUserUser"
        );
        console.log(response.data.result); // ตรวจสอบข้อมูลที่ได้รับ

        // กรองตาม username หรือข้อมูลอื่นที่มี
        const userList = response.data.result.filter((user) => user.username); // ตรวจสอบว่า user.username มีอยู่จริง
        console.log(userList); // ดูผลลัพธ์ที่กรองแล้ว
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchInspectionData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fire/fire");
        if (Array.isArray(response.data.result)) {
          const completeReports = response.data.result.filter(
            (item) => item.status === "complete"
          );
          setInspectionData(completeReports);
          setFilteredReport(completeReports);
        } else {
          console.error("Response data is not an array", response.data);
        }
      } catch (error) {
        console.error("Error fetching inspection data:", error);
      }
    };

    fetchUsers();
    fetchInspectionData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = inspectionData.filter((item) => {
      const serial = item.serial_number
        ? String(item.serial_number).toLowerCase()
        : "";
      const user = item.user_id ? String(item.user_id).toLowerCase() : "";
      return serial.includes(term) || user.includes(term);
    });

    setFilteredReport(term ? filtered : inspectionData);
    setCurrentPage(1);
  };

  const handlePopupOpen = (item) => {
    setSelectedReport(item);
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setSelectedReport(null);
  };

  const handleAssign = async () => {
    if (!selectedReport || !assignUser) {
      alert("Please select a report and assign a user.");
      return;
    }

    const inspectorID = assignUser; // ใช้ assignUser เป็น user_id จาก dropdown
    const assignBy = localStorage.getItem("userID");

    if (!assignBy) {
      alert("No user ID found in localStorage.");
      return;
    }

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const formattedTime = now.toLocaleTimeString("en-GB");

    try {
      const reportResponse = await axios.post(
        "http://localhost:3000/fire/sendReports",
        {
          description: "ถึงรอบตรวจถังดับเพลิง",
          date: formattedDate,
          time: formattedTime,
          fire_id: selectedReport.fire_id,
          user_id: assignBy,
        }
      );

      const report_id = reportResponse.data.data.data.insertId;

      if (reportResponse.status === 201) {
        const assignResponse = await axios.post(
          "http://localhost:3000/fire/assign",
          {
            date: formattedDate,
            time: formattedTime,
            assign_by: assignBy,
            report_id: report_id,
            insp_id: inspectorID, // ส่ง user_id ไปที่ API
          }
        );

        if (assignResponse.status === 201) {
          alert("Assignment successful!");
          handlePopupClose();
        } else {
          alert("Failed to assign inspector.");
        }
      } else {
        alert("Failed to create report.");
      }
    } catch (error) {
      console.error("Error assigning report:", error);
      alert("An error occurred while assigning.");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="inspection-Container">
      <div className="admin-header">
        <div className="admin-search-bar">
          <FaSearch className="admin-search-bar-icon" />
          <input
            type="text"
            placeholder="Search by ID or S/N"
            value={searchTerm}
            onChange={handleSearch}
            style={{ border: "none", outline: "none", width: "100%" }}
          />
        </div>
      </div>
      <div className="admin-table-container">
        <table
          className="admin-data-table"
          style={{
            width: "100%",
            marginTop: "20px",
            border: "1px solid #f97316",
            borderRadius: "10px",
          }}
        >
          <thead>
            <tr>
              <th>S/N</th>
              <th>MFD</th>
              <th>EXP</th>
              <th>Last check</th>
              <th>Next check</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.serial_number}</td>
                  <td>{item.fire_mfd.split("T")[0]}</td>
                  <td>{item.fire_exp.split("T")[0]}</td>
                  <td>{item.latest_check.split("T")[0]}</td>
                  <td>{item.next_check.split("T")[0]}</td>
                  <td>
                    <button
                      onClick={() => handlePopupOpen(item)}
                      className="checkwork-button"
                      style={{
                        color: "black",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                        backgroundColor: "transparent",
                        borderRadius: "100%",
                        padding: "5px",
                        width: "40px",
                        height: "40px",
                      }}
                    >
                      <GoChecklist />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No data available</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="admin-unit-pagination">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || totalPages === 0}
          >
            &lt;
          </button>
          <span>
            {currentPage} out of {totalPages > 0 ? totalPages : 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            &gt;
          </button>
        </div>

        {isPopupOpen && selectedReport && (
          <div className="admin-checkwork-container" onClick={handlePopupClose}>
            <div onClick={(e) => e.stopPropagation()}>
              <h2 style={{ color: "#000000" }}>Inspection</h2>
              <p>
                <strong>S/N :</strong> {selectedReport.serial_number}
              </p>
              <p>
                <strong>Manufactured Date :</strong>{" "}
                {selectedReport.fire_mfd.split("T")[0]}
              </p>
              <p>
                <strong>Expiration Date :</strong>{" "}
                {selectedReport.fire_exp.split("T")[0]}
              </p>
              <p>
                <strong>Last Check :</strong>{" "}
                {selectedReport.latest_check.split("T")[0]}
              </p>
              <p>
                <strong>Next Check :</strong>{" "}
                {selectedReport.next_check.split("T")[0]}
              </p>
              <p>
                <strong>Remarks :</strong> {selectedReport.remarks}
              </p>
              <select
                className="admin-assign-input-user"
                value={assignUser}
                onChange={(e) => setAssignUser(e.target.value)}
              >
                <option value="">-- Select User --</option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.username} {/* แสดง username แทน user_id */}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="admin-assign-button" onClick={handleAssign}>
                  Assign
                </button>
                <button
                  className="admin-close-button"
                  onClick={handlePopupClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inspection;
