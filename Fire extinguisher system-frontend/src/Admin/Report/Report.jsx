import { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import "./Report.css";
import { FaSearch } from "react-icons/fa";
import { GoChecklist } from "react-icons/go";

function Report() {
  const [report, setReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignUser, setAssignUser] = useState("");
  const [users, setUsers] = useState([]); // เก็บข้อมูลผู้ใช้

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fire/report");
        setReport(response.data);
        setFilteredReport(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fire/getAllUserUser");
        setUsers(response.data.result); // เก็บข้อมูลผู้ใช้ที่ดึงมา
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);




  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredReport(report);
    } else {
      setFilteredReport(
        report.filter((item) => {
          const serial = item.serial_number
            ? String(item.serial_number).toLowerCase()
            : "";
          const user = item.user_id ? String(item.user_id).toLowerCase() : "";
          return serial.includes(term) || user.includes(term);
        })
      );
    }
  };



  const handleRowClick = (item) => {
    setSelectedReport(item);
  };

  const handlePopupOpen = (item) => {
    setSelectedReport(item);
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setAssignUser("");
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
          report_id: selectedReport.report_id,
          insp_id: inspectorID,
          fire_id: null,
          description: null,
        }
      );
      console.log(reportResponse.data);

      // const report_id = reportResponse.data.data.data.insertId;
      // const report_id = selectedReport.report_id;

      // if (reportResponse.status === 201) {
      //   const assignResponse = await axios.post(
      //     "http://localhost:3000/fire/assign",
      //     {
      //       date: formattedDate,
      //       time: formattedTime,
      //       assign_by: assignBy,
      //       report_id: report_id,
      //       insp_id: inspectorID, // ส่ง user_id ไปที่ API
      //     }
      //   );

      //   if (assignResponse.status === 201) {
      //     alert("Assignment successful!");
      //     handlePopupClose();
      //   } else {
      //     alert("Failed to assign inspector.");
      //   }
      // } else {
      //   alert("Failed to create report.");
      // }
    } catch (error) {
      console.error("Error assigning report:", error);
      alert("An error occurred while assigning.");
    }
  };



  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReport.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

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
    <div>
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

      <div className="admin-inspection-container">
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
                <th>By</th>
                <th>Date</th>
                <th>Check</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={index} onClick={() => handleRowClick(item)}>
                    <td>{item.serial_number}</td>
                    <td>{item.user_id}</td>
                    <td>{item.date.split("T")[0]}</td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePopupOpen(item);
                        }}
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
                  <td colSpan="4">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="admin-report-pagination">
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
        </div>

        {isPopupOpen && (
          <div className="admin-checkwork-container" onClick={handlePopupClose}>
            <div className="admin-checkwork-popup-box" onClick={(e) => e.stopPropagation()}>
              <h2>Report Details</h2>

              <div>
                <img src={`http://localhost:3000/fire/uploads/${selectedReport.filename}`} alt=""
                style={{ width: "100px", height: "auto" }} />

              </div>

              {selectedReport && (
                <>
                  <p>
                    <strong>S/N :</strong> {selectedReport.serial_number}
                  </p>
                  <p>
                    <strong>Date :</strong> {selectedReport.date.split("T")[0]}
                  </p>
                  <p>
                    <strong>Time :</strong> {selectedReport.time}
                  </p>
                  <p className="remarks">{selectedReport?.description}</p>
                </>
              )}

              {/* Dropdown สำหรับเลือกผู้ใช้ */}
              <Select
                options={userOptions}
                value={userOptions.find((option) => option.value === assignUser)}
                onChange={(selectedOption) => setAssignUser(selectedOption?.value || '')}
                placeholder="-- Select User --"
                isClearable
                isSearchable
                styles={{
                  control: (base) => ({
                    ...base,
                    fontSize: "16px",
                    minHeight: "38px",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="assign-button" onClick={handleAssign}>
                  Assign
                </button>
                <button className="close-button" onClick={handlePopupClose}>
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

export default Report;
