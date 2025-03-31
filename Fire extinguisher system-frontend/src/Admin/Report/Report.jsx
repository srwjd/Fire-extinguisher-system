import { useEffect, useState } from "react";
import axios from "axios";
import "./Report.css";
// import { FaSearch } from "react-icons/fa";

function Report() {
    const [report, setReport] = useState([]);
    const [filteredReport, setFilteredReport] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [assignUser, setAssignUser] = useState("");

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

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (!term) {
            setFilteredReport(report);
        } else {
            setFilteredReport(
                report.filter((item) => {
                    const serial = item.serial_number ? String(item.serial_number).toLowerCase() : "";
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
      setSelectedReport(item);  // This is where the state is set
      console.log("Selected Report ID:", item.report_id);  // Make sure the item has the 'id' field
      setIsPopupOpen(true);
  };

    const handlePopupClose = () => {
        setIsPopupOpen(false);
        setAssignUser(""); // รีเซ็ตค่า assignUser
    };

    const handleAssign = async () => {
        if (!selectedReport || !assignUser.trim()) {
            alert("Please select a report and enter an inspector ID.");
            return;
        }

        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const formattedTime = now.toLocaleTimeString("en-GB"); // HH:MM:SS

        const assignBy = localStorage.getItem("userID");

     if (!assignBy) {
         alert("No user ID found in localStorage.");
         return;
     }

        try {
            const response = await axios.put("http://localhost:3000/fire/sendAssign", {
                date: formattedDate,
                time: formattedTime,
                assign_by: assignBy, // เปลี่ยนเป็นชื่อผู้ใช้จริง
                report_id: selectedReport.report_id,
                insp_id: assignUser.trim()
            });

            if (response.status === 200) {
                alert("Assignment successful!");
                handlePopupClose();
            }
        } catch (error) {
            console.error("Error assigning report:", error);
            alert("Failed to assign report.");
        }
    };

    return (
        <div>
            <div className="header">
                <h2>Submitted by user</h2>&nbsp;&nbsp;&nbsp;&nbsp;
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by ID or S/N"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="inspection-container">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>S/N</th>
                                <th>By</th>
                                <th>Date</th>
                                <th>Check</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReport.length > 0 ? (
                                filteredReport.map((item, index) => (
                                    <tr key={index} onClick={() => handleRowClick(item)}>
                                        <td>{item.serial_number}</td>
                                        <td>{item.user_id}</td>
                                        <td>{item.date.split("T")[0]}</td>
                                        <td>
                                            <button onClick={(e) => { e.stopPropagation(); handlePopupOpen(item); }}>📋</button>
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

                    <div className="pagination">
                        <button>{"<"}</button>
                        <span>1 out of 10</span>
                        <button>{">"}</button>
                    </div>
                </div>

                {isPopupOpen && (
                    <div className="checkwork-container" onClick={handlePopupClose}>
                        <h2>Report Details</h2>
                        <div className="image-placeholder" onClick={(e) => e.stopPropagation()}></div>
                        {selectedReport && (
                            <>
                                <p><strong>S/N :</strong> {selectedReport.serial_number}</p>
                                <p><strong>Date :</strong> {selectedReport.date.split("T")[0]}</p>
                                <p><strong>Time :</strong> {selectedReport.time}</p>
                                <p className="remarks">{selectedReport?.description}</p>
                            </>
                        )}
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

export default Report;
