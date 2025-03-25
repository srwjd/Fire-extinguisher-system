import { useEffect, useState } from "react";
import axios from "axios";

// import "./Report.css";
// import { FaSearch } from "react-icons/fa";

function Report() {
    const [report, setReport] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get("http://localhost:3000/fire/report"); // เปลี่ยน URL ตาม backend ของคุณ
                setReport(response.data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        };
    
        fetchReports();
    }, []);

    
    return (
        <div>
            {/* Header with Search Bar */}
            <div className="header">
                <h2>Submitted by user</h2>&nbsp;&nbsp;&nbsp;&nbsp;
                <div className="search-bar">
                    {/* <span><FaSearch className="search-icon" /></span> */}
                    <input type="text" placeholder="Search : S/N" />
                </div>
            </div>
            <div className="inspection-container">
                <div className="table-container">
                    {/* Table Section */}
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
                            {report.length > 0 ? (
                                report.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.serial_number}</td>
                                        <td>{item.user_id}</td>
                                        <td>{item.date.split("T")[0]}</td>
                                        <td><button>Check</button></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No reports found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="pagination">
                        <button>{"<"}</button>
                        <span>1 out of 10</span>
                        <button>{">"}</button>
                    </div>
                </div>

                <div className="checkwork-container">
                    <h2>Report</h2>
                    <div className="image-placeholder"></div>
                    <p><strong>S/N :</strong> NFPA 10-0001</p>
                    <p><strong>Date :</strong> 03/07/2568</p>
                    <p><strong>Time :</strong> 12:00 AM</p>
                    <p><strong>Location :</strong> Sripatum Uni</p>


                    <textarea
                        className="remarks"
                        placeholder="หมายเหตุ :"

                    />

                    <input type="text" placeholder="User" className='input' /> &nbsp;&nbsp;&nbsp;&nbsp;
                    <button className="assign-button">Assign</button>

                </div>

            </div>
        </div>
    );
}


export default Report;