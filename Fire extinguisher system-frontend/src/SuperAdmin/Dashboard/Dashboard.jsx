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

  const [fireExtinguishers, setFireExtinguishers] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFireExtinguishers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fire/fireExtinguishersByMonth");
        console.log(response.data);  // ตรวจสอบข้อมูลที่ได้
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid data format");
        }

        const statuses = ["complete", "process", "report"];

        // แปลงข้อมูลให้อยู่ในรูปแบบที่ BarChart ต้องการ
        const transformedData = response.data.reduce((acc, item) => {
          let monthEntry = acc.find((entry) => entry.month === item.month);
          if (!monthEntry) {
            monthEntry = { month: item.month };
            statuses.forEach((status) => {
              monthEntry[status] = 0;
            });
            acc.push(monthEntry);
          }
          monthEntry[item.status] = item.count;
          return acc;
        }, []);

        setFireExtinguishers(transformedData);
      } catch (error) {
        console.error("Error fetching fire extinguisher data:", error);
        setError("Failed to load fire extinguisher data");
      }
    };
    fetchFireExtinguishers();
  }, []);

  return (
    <div className="dashboardContainer">
      <div className="dashboardContainerTop">
        {/* Users Card */}
        <div className="dashboard-user-card">
          <h2 className="dashboard-users-title" style={{ paddingLeft: "15px" }}>
            Users
          </h2>
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
          <h2 className="dashboard-units-title" style={{ paddingLeft: "15px" }}>
            Units
          </h2>
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

      {/* Status of Fire Extinguishers */}
      <div className="dashboard-containerBottom">
        <div className="dashboard-status-card">
          <h2 className="dashboard-status-title">
            Status of Fire Extinguishers
          </h2>
          <div className="dashboard-status-content">
          <ResponsiveContainer width="100%" height={450}>
              <BarChart data={fireExtinguishers.sort((a, b) => new Date(a.month) - new Date(b.month))}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #000",
                            padding: "10px",
                            borderRadius: "5px",
                          }}
                        >
                          <p><strong>{label}</strong></p>
                          <p>Complete : {data.complete || 0}</p>
                          <p>Process : {data.process || 0}</p>
                          <p>Report : {data.report || 0}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="complete" fill="#4CB760" name="Complete" />
                <Bar dataKey="process" fill="#F7CE36" name="Process" />
                <Bar dataKey="report" fill="#DB5362" name="Report" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
