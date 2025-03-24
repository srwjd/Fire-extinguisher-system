import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Test.css";

function Dashboard() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fire/test2");
        setUnits(response.data);
      } catch (error) {
        console.error("Error fetching unit data:", error);
      }
    };
    fetchUnits();
  }, []);

  // คำนวณจำนวนสาขาย่อยทั้งหมด
  const totalBranches = units.reduce((total, unit) => total + unit.branch_count, 0);

  return (
    <div>
      <div className="dashboardContainerTop">
        <div className="dashboard-users-card">
          <h2 className="dashboard-users-title" style={{ paddingLeft: "15px" }}>
            Users
          </h2>
          <div className="dashboard-users-content">
            {/* Show users' roles here if available */}
          </div>
        </div>

        <div className="dashboard-units-card">
          <h2 className="dashboard-units-title" style={{ paddingLeft: "15px" }}>
            Units
          </h2>
          <div className="dashboard-units-content">
            <div className="dashboard-unit-item">
              <span>Company : {units.length}</span>
            </div>
            {/* แสดงจำนวนสาขาย่อยทั้งหมด */}
            <div>
              <span className="dashboard-unit-item">Branches: {totalBranches}</span>
            </div>
            {units.length > 0 ? (
              units.map((unit) => (
                <div className="dashboard-unit-item" key={unit.company_id}>
                  <span>{unit.company_name}</span>
                  <span className="dashboard-unit-count">
                    {unit.branch_count}
                  </span>
                </div>
              ))
            ) : (
              <div>Loading unit data...</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-containerBottom">
        <div className="dashboard-status-card">
          <h2 className="dashboard-status-title">Status of Fire Extinguishers</h2>
          <div className="dashboard-status-content">
            {/* Placeholder for Fire Extinguisher Data */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
