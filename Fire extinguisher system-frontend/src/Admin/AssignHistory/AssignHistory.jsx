import "./AssignHistory.css";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";

function AssignHistory() {
  const [assign, setAssign] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับเก็บค่าค้นหา

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // กรองข้อมูล Assigns ตามค่าค้นหา
  const filteredAssigns = assign.filter((item) =>
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetch("http://localhost:3000/fire/assign")
      .then((response) => response.json())
      .then((data) => {
        if (data.result && Array.isArray(data.result)) {
          setAssign(data.result);
        } else {
          setAssign([]); // ตั้งค่าให้เป็น array ว่างแทน undefined
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setAssign([]);
      });
  }, []);

  useEffect(() => {
    console.log(assign);
  }, [assign]);

  return (
    <div className="assign-history-container">
      <div className="admin-header">
        <div className="admin-search-bar">
          <FaSearch className="admin-search-bar-icon" />
          <input
            type="text"
            placeholder="Search : S/N"
            value={searchTerm}
            onChange={handleSearchChange}
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
                <th style={{ textAlign: "center" }}>Assign to</th>
                <th style={{ textAlign: "center" }}>Assign By</th>
                <th style={{ textAlign: "center" }}>Date</th>
                <th style={{ textAlign: "center" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssigns.length > 0 ? (
                filteredAssigns.map((item, index) => (
                  <tr key={index}>
                    <td>{item.serial_number}</td>
                    <td>{item.username}</td>
                    <td>{item.assign_by}</td>
                    <td>{item.date.split("T")[0]}</td>
                    <td>{item.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AssignHistory;
