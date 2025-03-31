import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import "./Report.css";

function Report() {
  const [branches, setBranches] = useState([]);
  const [fires, setFires] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    axios
      .get(`http://localhost:3000/fire/company/${companyId}`)
      .then((response) => setBranches(response.data.branches))
      .catch((error) => console.error("Error fetching branches:", error));
  }, [companyId]);

  useEffect(() => {
    const url = selectedBranchId
      ? `http://localhost:3000/fire/branches/${selectedBranchId}`
      : `http://localhost:3000/fire/company/${companyId}/fires`;

    axios
      .get(url)
      .then((response) => setFires(response.data))
      .catch((error) => console.error("Error fetching fires:", error));
  }, [selectedBranchId, companyId]);

  const filteredFires = fires.filter((fire) => {
    const latestCheckDate = fire.latestCheck
      ? fire.latestCheck.split("T")[0]
      : "N/A";
    return (
      fire.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fire.fire_mfd.split("T")[0].includes(searchTerm) ||
      fire.fire_exp.split("T")[0].includes(searchTerm) ||
      latestCheckDate.includes(searchTerm) ||
      fire.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFires = filteredFires.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFires.length / itemsPerPage);

  return (
    <div>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search all fields"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: "none" }}
          className="search-input"
        />
      </div>
      <div className="branch-select">
      <select
        onChange={(e) => setSelectedBranchId(e.target.value)}
        value={selectedBranchId}
      >
        <option value="">All Branches</option>
        {branches.map((branch) => (
          <option key={branch.branch_id} value={branch.branch_id}>
            {branch.branch_name}
          </option>
        ))}
      </select>
      </div>
      {currentFires.length > 0 ? (
        <table className="styled-table">
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
            {currentFires.map((fire) => (
              <tr key={fire.fire_id}>
                <td>{fire.serial_number}</td>
                <td>{fire.fire_mfd.split("T")[0]}</td>
                <td>{fire.fire_exp.split("T")[0]}</td>
                <td>
                  {fire.latest_check ? fire.latest_check.split("T")[0] : "N/A"}
                </td>
                <td>
                  {fire.next_check ? fire.next_check.split("T")[0] : "N/A"}
                </td>
                <td>{fire.status}</td>
                <td>
                  <Link to={`/report/${fire.fire_id}`} style={{ color: "#000000"}}><TbReportSearch /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>ยังไม่มีข้อมูลถังในสาขานี้</p>
      )}
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

export default Report;
