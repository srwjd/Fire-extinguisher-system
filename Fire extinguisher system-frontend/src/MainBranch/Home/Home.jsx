import axios from "axios";
import { useState, useEffect } from "react";
import "./Home.css";

function Home() {
  const [branches, setBranches] = useState([]);
  const [fires, setFires] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  const itemsPerPage = 10; // จำนวนแถวต่อหน้า
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (!companyId) {
      console.error("No companyId found in localStorage");
      return;
    }

    // ดึงข้อมูล branches และ fires
    axios
      .get(`http://localhost:3000/fire/company/${companyId}`)
      .then((response) => {
        setBranches(response.data.branches);
        setFires(response.data.fires);
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
      });
  }, [companyId]);

  // ฟังก์ชันเพื่อคำนวณจำนวนถังดับเพลิงในแต่ละสาขา
  const getFireStatusCountForBranch = (branchId, status) => {
    return fires.filter(
      (fire) => fire.branch_id === branchId && fire.status === status
    ).length;
  };

  // คำนวณค่าที่ใช้สำหรับแบ่งหน้า
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBranches = branches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(branches.length / itemsPerPage);

  return (
    <div>
      <table className="Table-MainBranch">
        <thead>
          <tr>
            <th>Branch ({branches.length})</th>
            <th>Fire extinguisher</th>
            <th>Report</th>
            <th>Complete</th>
          </tr>
        </thead>
        <tbody>
          {currentBranches.map((branch) => {
            const totalFires = fires.filter(
              (fire) => fire.branch_id === branch.branch_id
            ).length;
            const reportedCount = getFireStatusCountForBranch(
              branch.branch_id,
              "report"
            );
            const resolvedCount = getFireStatusCountForBranch(
              branch.branch_id,
              "complete"
            );

            return (
              <tr key={branch.branch_id}>
                <td>{branch.branch_name}</td>
                <td>{totalFires > 0 ? totalFires : "ไม่มีข้อมูลถัง"}</td>
                <td>{reportedCount > 0 ? reportedCount : "ไม่มี Report"}</td>
                <td>{resolvedCount > 0 ? resolvedCount : "ยังไม่ได้ลงตรวจ"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ปุ่มเปลี่ยนหน้า */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        <span>
          {currentPage} out of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default Home;
