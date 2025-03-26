import { useEffect, useState } from "react";
import axios from "axios";
import "./Checkwork.css";
import { FaSearch } from "react-icons/fa";

function Report() {
    const [report, setReport] = useState([]);
    const [filteredReport, setFilteredReport] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get("http://localhost:3000/fire/inspec");
                setReport(response.data);
                setFilteredReport(response.data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        };
        
        fetchReports();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLocaleLowerCase();
        setSearchTerm(term);
    
        if (!term) {
            setFilteredReport(report);
        } else {
            setFilteredReport(
                report.filter((item) => {
                    const serial = item.serial_number ? String(item.serial_number).toLocaleLowerCase() : "";
                    const user = item.user_id ? String(item.user_id).toLocaleLowerCase() : "";
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
                                        <td><button onClick={(e) => { e.stopPropagation(); handlePopupOpen(item); }}>📋</button></td>
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
                            </>
                        )}
                        <p>Select a report to view details</p>
                        <textarea className="remarks" placeholder="หมายเหตุ :" />
                        <input type="text" placeholder="User" className='input' /> &nbsp;&nbsp;&nbsp;&nbsp;
                        <button onClick={handlePopupClose} className="assign-button" style={{backgroundColor: "red"}}>Fail</button>
                        <button onClick={handlePopupClose} className="close-button" style={{backgroundColor: "green"}}>Pass</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Report;
