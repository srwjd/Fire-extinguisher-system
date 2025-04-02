import { useEffect, useState } from "react";
import axios from "axios";
import { TbReportSearch } from "react-icons/tb";
import "./Report.css";

function Report() {
    const [branchId, setBranchId] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        const storedBranchId = localStorage.getItem("branchId");
        if (storedBranchId) {
            setBranchId(storedBranchId);
        }
    }, []);

    useEffect(() => {
        if (!branchId) return;

        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/fire/branches/${branchId}`);
                if (res.data.branch) {
                    setData(res.data.branch);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [branchId]);

    return (
        <div>
            <div className="reportTable">
                <table className="tableContainer">
                    <thead>
                        <tr>
                            <th>S/N</th>
                            <th>MFD</th>
                            <th>EXP</th>
                            <th>Last Check</th>
                            <th>Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((fire, index) => (
                                <tr key={index}>
                                    <td>{fire.serial_number}</td>
                                    <td>{fire.fire_mfd ? fire.fire_mfd.split("T")[0] : "N/A"}</td>
                                    <td>{fire.fire_exp ? fire.fire_exp.split("T")[0] : "N/A"}</td>
                                    <td>{fire.latest_check ? fire.latest_check.split("T")[0] : "N/A"}</td>
                                    <td><a href={`/report/${fire.fire_id}`}  style={{ color: "#000000"}}><TbReportSearch /></a></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Report;
