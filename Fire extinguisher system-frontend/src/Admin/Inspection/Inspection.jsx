import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import './Inspection.css';

function Inspection() {
  const [inspectionData, setInspectionData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReport, setFilteredReport] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null); // For storing the selected report data
  const [assignUser, setAssignUser] = useState(""); // For handling the user input in the popup

  useEffect(() => {
    // Fetch inspection data on component mount
    const fetchInspectionData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/fire/fire');
        if (Array.isArray(response.data.result)) {
          // Filter data to only include reports with status "complete"
          const completeReports = response.data.result.filter(item => item.status === 'complete');
          setInspectionData(completeReports);  // Set filtered data
          setFilteredReport(completeReports);  // Initialize filtered report with complete data
        } else {
          console.error('Response data is not an array', response.data);
        }
      } catch (error) {
        console.error('Error fetching inspection data:', error);
      }
    };

    fetchInspectionData();
  }, []);  // Empty dependency array ensures it runs only once when the component mounts

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredReport(inspectionData);
    } else {
      setFilteredReport(
        inspectionData.filter((item) => {
          const serial = item.serial_number ? String(item.serial_number).toLowerCase() : "";
          const user = item.user_id ? String(item.user_id).toLowerCase() : "";
          return serial.includes(term) || user.includes(term);
        })
      );
    }
  };

  const handlePopupOpen = (item) => {
    console.log("Selected Fire Extinguisher: ", item);  // ดูข้อมูลถังดับเพลิงที่เลือก
    setSelectedReport(item);  // เก็บข้อมูลถังดับเพลิงที่เลือก
    setIsPopupOpen(true);  // เปิดป๊อปอัพ
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false); // Close the popup
    setSelectedReport(null); // Reset the selected report
  };

  const handleAssign = async () => {
    if (!selectedReport || !assignUser.trim()) {
      alert("Please select a report and enter an inspector ID.");
      return;
    }

    const inspectorID = assignUser.trim();
    const assignBy = localStorage.getItem("userID");

    if (!assignBy) {
      alert("No user ID found in localStorage.");
      return;
    }

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const formattedTime = now.toLocaleTimeString("en-GB");

    try {
      // Step 1: Create Report
      const reportResponse = await axios.post("http://localhost:3000/fire/sendReports", {
        description: "ถึงรอบตรวจถังดับเพลิง",
        date: formattedDate,
        time: formattedTime,
        fire_id: selectedReport.fire_id,
        user_id: assignBy
      });

      console.log("Response from server:", reportResponse);  // ดูข้อมูล response ทั้งหมด
      const report_id = reportResponse.data.data.data.insertId;
      console.log("Newly Created Report ID: ", report_id);  // ตรวจสอบค่าที่ได้จากการสร้างรายงาน

      if (reportResponse.status === 201) {
        // Step 2: Assign Inspector
        const assignResponse = await axios.post("http://localhost:3000/fire/assign", {
            date: formattedDate,
            time: formattedTime,
            assign_by: assignBy,
            report_id: report_id,  // ส่งค่า report_id ที่ได้จากการสร้างรายงาน
            insp_id: inspectorID
        });

        console.log("Assign Response:", assignResponse.data); // ดูข้อมูลที่ได้จากการ assign

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

  return (
    <div className='inspection-Container'>
      <div className="admin-header">
        <div className="admin-search-bar">
          <FaSearch className="admin-search-bar-icon" />
          <input
            type="text"
            placeholder="Search by ID or S/N"
            value={searchTerm}
            onChange={handleSearch}
            style={{ border: "none" }}
          />
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
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
            {filteredReport.length > 0 ? (
              filteredReport.map((item, index) => (
                <tr key={index}>
                  <td>{item.serial_number}</td>
                  <td>{item.fire_mfd.split("T")[0]}</td>
                  <td>{item.fire_exp.split("T")[0]}</td>
                  <td>{item.latest_check.split("T")[0]}</td>
                  <td>{item.next_check.split("T")[0]}</td>
                  <td>
                    <button onClick={() => handlePopupOpen(item)}>📋</button>
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

        <div className="pagination">
          <button>{"<"}</button>
          <div>1 out of 10</div>
          <button>{">"}</button>
        </div>

        {isPopupOpen && selectedReport && (
          <div className="checkwork-container" onClick={handlePopupClose}>
            <h2>Inspection</h2>
            <div className="image-placeholder" onClick={(e) => e.stopPropagation()}></div>
            <div>
              <p><strong>S/N :</strong> {selectedReport.serial_number}</p>
              <p><strong>Manufactured Date :</strong> {selectedReport.fire_mfd.split("T")[0]}</p>
              <p><strong>Expiration Date :</strong> {selectedReport.fire_exp.split("T")[0]}</p>
              <p><strong>Last Check :</strong> {selectedReport.latest_check.split("T")[0]}</p>
              <p><strong>Next Check :</strong> {selectedReport.next_check.split("T")[0]}</p>
              <p><strong>Remarks :</strong> {selectedReport.remarks}</p>
            </div>
            <input
              type="text"
              placeholder="User ID"
              className="input"
              value={assignUser}
              onChange={(e) => setAssignUser(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button className="assign-button" onClick={handleAssign}>Assign</button>
            <button onClick={handlePopupClose} className="close-button">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inspection;
 