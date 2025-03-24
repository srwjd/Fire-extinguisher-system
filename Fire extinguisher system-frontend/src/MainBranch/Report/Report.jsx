import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Report() {
    const [branches, setBranches] = useState([]);
    const [fires, setFires] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(""); // เก็บค่า branch ที่เลือก
    const [searchTerm, setSearchTerm] = useState(""); // ค่าที่พิมพ์ใน search bar
    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        // ดึงรายชื่อ branch ทั้งหมด
        axios
            .get(`http://localhost:3000/fire/company/${companyId}`)
            .then((response) => {
                setBranches(response.data.branches);
            })
            .catch((error) => {
                console.error("Error fetching branches:", error);
            });
    }, [companyId]);

    useEffect(() => {
        // ถ้ายังไม่เลือก branch -> ดึงข้อมูลถังทั้งหมดของบริษัท
        // ถ้าเลือก branch -> ดึงข้อมูลเฉพาะของสาขานั้น
        const url = selectedBranchId
            ? `http://localhost:3000/fire/branches/${selectedBranchId}`
            : `http://localhost:3000/fire/company/${companyId}/fires`;

        axios
            .get(url)
            .then((response) => {
                setFires(response.data);
            })
            .catch((error) => {
                console.error("Error fetching fires:", error);
            });
    }, [selectedBranchId, companyId]);

    // ฟังก์ชันการค้นหาข้อมูลถังที่ตรงกับคำที่ค้นหา
    const filteredFires = fires.filter((fire) => {
        const latestCheckDate = fire.latestCheck ? fire.latestCheck.split("T")[0] : "N/A";
        
        return (
            fire.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fire.fire_mfd.split("T")[0].includes(searchTerm) ||
            fire.fire_exp.split("T")[0].includes(searchTerm) ||
            latestCheckDate.includes(searchTerm) ||
            fire.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div>
            <h1>Report</h1>

            {/* ช่องค้นหาข้อมูล */}
            <input
                type="text"
                placeholder="Search all fields"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Dropdown เลือกสาขา */}
            <select onChange={(e) => setSelectedBranchId(e.target.value)} value={selectedBranchId}>
                <option value="">All Branches</option>
                {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                    </option>
                ))}
            </select>

            {/* แสดงตาราง หรือข้อความถ้าไม่มีข้อมูล */}
            {filteredFires.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <td>S/N</td>
                            <td>MFD</td>
                            <td>EXP</td>
                            <td>Last check</td>
                            <td>Next check</td>
                            <td>Status</td>
                            <td>Report</td>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFires.map((fire) => (
                            <tr key={fire.fire_id}>
                                <td>{fire.serial_number}</td>
                                <td>{fire.fire_mfd.split("T")[0]}</td>
                                <td>{fire.fire_exp.split("T")[0]}</td>
                                <td>{fire.latestCheck ? fire.latestCheck.split("T")[0] : "N/A"}</td>
                                <td>{fire.nextCheck ? fire.nextCheck.split("T")[0] : "N/A"}</td>
                                <td>{fire.status}</td>
                                <td>
                                <Link to={`/report/${fire.fire_id}`}>Report</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>ยังไม่มีข้อมูลถังในสาขานี้</p> // ถ้าไม่มีข้อมูลถัง
            )}
        </div>
    );
}

export default Report;
