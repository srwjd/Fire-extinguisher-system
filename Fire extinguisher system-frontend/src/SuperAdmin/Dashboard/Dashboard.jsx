import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

// Dummy data (replace with backend data when ready)
const statusOfFireExtinguishers = [
  { month: "Jan", Installed: 10, Checking: 5, Change: 3 },
  { month: "Feb", Installed: 10, Checking: 10, Change: 6 },
  { month: "Mar", Installed: 10, Checking: 10, Change: 5 },
  { month: "Apr", Installed: 10, Checking: 5, Change: 3 },
  { month: "May", Installed: 10, Checking: 5, Change: 3 },
  { month: "Jun", Installed: 10, Checking: 5, Change: 3 },
  { month: "Jul", Installed: 10, Checking: 5, Change: 3 },
  { month: "Aug", Installed: 10, Checking: 5, Change: 3 },
  { month: "Sep", Installed: 10, Checking: 5, Change: 3 },
  { month: "Oct", Installed: 10, Checking: 5, Change: 3 },
  { month: "Nov", Installed: 10, Checking: 5, Change: 3 },
  { month: "Dec", Installed: 10, Checking: 5, Change: 3 },
];

function Dashboard() {
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/fire/countByRole"
        );
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching role data :", error);
      }
    };
    fetchRoles();
  }, []);

  const [units, setUnits] = useState([]);
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/fire/countUnit"
        );
        setUnits(response.data);
      } catch (error) {
        console.error("Error fetching unit data :", error);
      }
    };
    fetchUnits();
  }, []);
  // คำนวณจำนวนสาขาย่อยทั้งหมด
  const totalBranches = units.reduce(
    (total, unit) => total + unit.branch_count,
    0
  );

  return (
    <div>
<div className="dashboardContainerTop">
  {/* Users Card */}
  <div className="dashboard-user-card">
    <h2 className="dashboard-users-title" style={{ paddingLeft: "15px" }}>Users</h2>
    <div className="dashboard-users-content">
      {roles.length > 0 ? (
        roles.map((role) => (
          <div className="dashboard-user-item" key={role.role_name}>
            <span>{role.role_name || "Unknown Role"}</span>
            <span style={{ fontWeight: "bold" }}>{role.count || 0}</span>
          </div>
        ))
      ) : (
        <div>No roles found</div>
      )}
    </div>
  </div>

  {/* Units Card */}
  <div className="dashboard-unit-card">
    <h2 className="dashboard-units-title" style={{ paddingLeft: "15px" }}>Units</h2>
    <div className="dashboard-units-content">
      <div className="dashboard-unit-item">
        <span>Company</span>
        <span style={{ fontWeight: "bold" }}>{units.length}</span>
      </div>
      <div className="dashboard-unit-item">
        <span>Branches</span>
        <span style={{ fontWeight: "bold" }}>{totalBranches}</span>
      </div>
      {units.length > 0 ? (
        units.map((unit) => (
          <div className="dashboard-unit-item" key={unit.company_id}>
            <span>{unit.company_name}</span>
            <span className="dashboard-unit-count">{unit.branch_count}</span>
          </div>
        ))
      ) : (
        <div>Loading unit data...</div>
      )}
    </div>
  </div>
</div>


      {/* Status of Fire Extinguishers */}
      <div className="dashboard-containerBottom">
        <div className="dashboard-status-card">
          <h2 className="dashboard-status-title">
            Status of Fire Extinguishers
          </h2>
          <div className="dashboard-status-content">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={statusOfFireExtinguishers}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Installed" fill="#4CB760" />
                <Bar dataKey="Checking" fill="#F7CE36" />
                <Bar dataKey="Change" fill="#DB5362" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
