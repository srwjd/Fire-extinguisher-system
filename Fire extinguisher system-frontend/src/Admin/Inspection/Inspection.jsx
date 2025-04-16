import React, { useState, useEffect } from "react";
import Select from "react-select";
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
  const itemsPerPage = 10;
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
        "http://localhost:3000/fire/sendAssign",
        {
          date: formattedDate,
          time: formattedTime,
          assign_by: assignBy,
          report_id: null,
          insp_id: inspectorID,
          fire_id: selectedReport.fire_id,
          description: "ถึงรอบตรวจถังดับเพลิง",
        }
      );
      setIsPopupOpen(false);
      window.location.reload();
      console.log(reportResponse);
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

  const userOptions = users.map((user) => ({
    value: user.user_id,
    label: user.username,
  }));

  return (
    <div className="inspection-Container">
      <div className="admin-header">
        <div className="admin-search-bar">
          <FaSearch className="admin-search-bar-icon" />
          <input
            type="text"
            placeholder="Search : S/N"
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
              <th style={{ textAlign: "center" }}>S/N</th>
              <th style={{ textAlign: "center" }}>MFD</th>
              <th style={{ textAlign: "center" }}>EXP</th>
              <th style={{ textAlign: "center" }}>Last check</th>
              <th style={{ textAlign: "center" }}>Next check</th>
              <th style={{ textAlign: "center" }}>Check</th>
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
                        margin: "0 auto",
                        padding: "0px",
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
              <Select
                options={userOptions}
                value={userOptions.find((option) => option.value === assignUser)}
                onChange={(selectedOption) => setAssignUser(selectedOption?.value || '')}
                placeholder="-- Select User --"
                isClearable
                isSearchable
                styles={{
                  control: (base, state) => ({
                    ...base,
                    fontSize: "16px",
                    minHeight: "38px",
                    borderColor: "#f97316", // สีขอบส้ม
                    boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none", // ขอบตอน focus
                    "&:hover": {
                      borderColor: "#f97316", // ขอบตอน hover
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />

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
