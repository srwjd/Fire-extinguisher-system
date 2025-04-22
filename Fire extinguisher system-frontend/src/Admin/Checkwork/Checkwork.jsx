import { useEffect, useState } from "react";
import axios from "axios";
import "./Checkwork.css";
import { FaSearch } from "react-icons/fa";
import { GoChecklist } from "react-icons/go";

function Checkwork() {
  const [report, setReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [checkboxes, setCheckboxes] = useState({
  //   damage: false,
  //   pressure: false,
  //   headValve: false,
  //   safetySeal: false,
  //   position: false,
  // });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fire/inspec");
        const filteredData = response.data.filter(
          (item) => item.status === "process"
        );
        setReport(filteredData);
        setFilteredReport(filteredData);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // const handleSearch = (e) => {
  //   const term = e.target.value.toLocaleLowerCase();
  //   setSearchTerm(term);

  //   if (!term) {
  //     setFilteredReport(report);
  //   } else {
  //     setFilteredReport(
  //       report.filter((item) => {
  //         const serial = item.serial_number
  //           ? String(item.serial_number).toLocaleLowerCase()
  //           : "";
  //         const user = item.user_id
  //           ? String(item.user_id).toLocaleLowerCase()
  //           : "";
  //         return serial.includes(term) || user.includes(term);
  //       })
  //     );
  //   }
  // };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  useEffect(() => {
    const filtered = report.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.serial_number.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
    setFilteredReport(filtered);
  }, [searchTerm, report]);

  const handlePopupOpen = (item) => {
    setSelectedReport(item);
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };


  const handleFail = async () => {
    if (!selectedReport) return;

    try {
      // ลบรายงานออกจากฐานข้อมูล
      await axios.delete("http://localhost:3000/fire/deleteProcess", {
        data: { inspection_id: selectedReport.inspection_id },
      });

      // อัปเดตสถานะของ Fire
      await axios.post("http://localhost:3000/fire/updatedStatus", {
        fire_id: selectedReport.fire_id,
      });

      alert("Report deleted and status updated successfully!");
      setIsPopupOpen(false);

      // อัปเดตรายการใหม่
      setReport((prevReports) =>
        prevReports.filter(
          (report) => report.inspection_id !== selectedReport.inspection_id
        )
      );
      setFilteredReport((prevReports) =>
        prevReports.filter(
          (report) => report.inspection_id !== selectedReport.inspection_id
        )
      );
    } catch (error) {
      console.error("Error handling fail:", error);
      alert("Failed to process the fail action.");
    }
  };

  const handlePass = async () => {
    if (!selectedReport) return;

    try {
      // อัปเดตสถานะเป็น "complete"
      await axios.post("http://localhost:3000/fire/updatedStatusComplete", {
        fire_id: selectedReport.fire_id,
      });

      alert("Status updated to complete successfully!");
      setIsPopupOpen(false);

      // อัปเดตรายการให้ไม่แสดงรายการที่ pass แล้ว
      setReport((prevReports) =>
        prevReports.filter(
          (report) => report.fire_id !== selectedReport.fire_id
        )
      );
      setFilteredReport((prevReports) =>
        prevReports.filter(
          (report) => report.fire_id !== selectedReport.fire_id
        )
      );
    } catch (error) {
      console.error("Error handling pass:", error);
      alert("Failed to update status to complete.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

  const reportsToDisplay = filteredReport.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div>
      <div className="admin-header">
        <div className="admin-search-bar">
          <FaSearch className="admin-search-bar-icon" />
          <input
            type="text"
            placeholder="Search : ID or S/N"
            value={searchTerm}
            onChange={handleSearch}
            style={{ border: "none", outline: "none", width: "100%" }}
          />
        </div>
      </div>
      <div className="inspection-container">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>S/N</th>
                <th style={{ textAlign: "center" }}>By</th>
                <th style={{ textAlign: "center" }}>Date</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "center" }}>Check</th>
              </tr>
            </thead>
            <tbody>
              {reportsToDisplay.length > 0 ? (
                reportsToDisplay.map((item) => (
                  <tr key={item.inspection_id} onClick={() => setSelectedReport(item)}>
                    <td>{item.serial_number}</td>
                    <td>{item.username}</td>
                    <td>{item.date.split("T")[0]}</td>
                    <td className={item.status === "process" ? "status-process" : "status-other"}>
                      {item.status}
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePopupOpen(item);
                        }}
                        className="checkwork-button"
                        title="Check"
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
                  <td colSpan="5">No reports found</td>
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
        </div>

        {isPopupOpen && (
          <div
            className={`checkwork-container ${isPopupOpen ? "open" : ""}`}
            onClick={handlePopupClose}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <h2>Report Details</h2>
              {selectedReport && (
                <>
                  <div
                    className="image-placeholder"
                  >
                    {selectedReport.filename ? (
                      <img
                        src={`http://localhost:3000/fire/uploads/${selectedReport.filename}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <p style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "gray", height: "100%" }}>No image available</p>
                    )}
                  </div>
                  <p style={{ textAlign: "left" }}>
                    <strong>S/N : </strong> {selectedReport.serial_number}
                  </p>
                  <p style={{ textAlign: "left" }}>
                    <strong>Date : </strong> {selectedReport.date.split("T")[0]}
                  </p>
                  <p style={{ textAlign: "left" }}>
                    <strong>Time : </strong> {selectedReport.time}
                  </p>
                </>
              )}
              <div
                className="checkwork-details-popup"
                style={{ width: "100%" }}
              >
                <label>
                  <input
                    type="checkbox"
                    name="damage"
                    checked={selectedReport?.condition_ok}
                    readOnly
                  />{" "}
                  สภาพของถังไม่เสียหาย
                </label>
                <br />
                <label>
                  <input
                    type="checkbox"
                    name="pressure"
                    checked={selectedReport?.pressure_ok}
                    readOnly
                  />{" "}
                  ความดันของถังอยู่ในระดับที่เหมาะสม
                </label>
                <br />
                <label>
                  <input
                    type="checkbox"
                    name="headValve"
                    checked={selectedReport?.nozzle_clear}
                    readOnly
                  />{" "}
                  หัวฉีดและวาล์วไม่อุดตัน
                </label>
                <br />
                <label>
                  <input
                    type="checkbox"
                    name="safetySeal"
                    checked={selectedReport?.pin_sealed}
                    readOnly
                  />{" "}
                  สลักนิรภัยและซีลป้องกันไม่ถูกดึงออก
                </label>
                <br />
                <label>
                  <input
                    type="checkbox"
                    name="position"
                    checked={selectedReport?.placement_correct}
                    readOnly
                  />{" "}
                  ตำแหน่งการติดตั้งเหมาะสม
                </label>
                <br />
              </div>
              <p className="remarks">หมายเหตุ : {selectedReport?.description}</p>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button onClick={handleFail} className="checkwork-assign-button">
                Fail
              </button>
              <button onClick={handlePass} className="checkwork-close-button">
                Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkwork;