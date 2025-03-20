import React from "react";
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

// data from backend แต่ยังไม่ได้เอามาใส่ รอไปก่อน อันนี้เมคขึ้นมางับ
const data = [
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
  return (
    <div>
      <div className="dashboardContainerTop">
        {/* UserCard show data */}
        <div className="dashboard-users-card">
          <h2 className="dashboard-users-title" style={{ paddingLeft: "15px" }}>
            Users
          </h2>
          <div className="dashboard-users-content">
            <div className="dashboard-user-item">
              <span>Super Admins</span> <span className="dashboard-user-count">1</span>
            </div>
            <div className="dashboard-user-item">
              <span>Admins</span> <span className="dashboard-user-count">2</span>
            </div>
            <div className="dashboard-user-item">
              <span>Users</span> <span className="dashboard-user-count">5</span>
            </div>
            <div className="dashboard-user-item">
              <span>Fire extinguisher</span>{" "}
              <span className="dashboard-user-count">25</span>
            </div>
          </div>
        </div>
        {/* UnitCard show data */}
        <div className="dashboard-units-card">
          <h2 className="dashboard-units-title" style={{ paddingLeft: "15px" }}>
            Units
          </h2>
          <div className="dashboard-units-content">
            <div className="dashboard-unit-item">
              <span>Company</span> <span className="dashboard-unit-count">2</span>
            </div>
            <div className="dashboard-unit-item">
              <span>Branches</span> <span className="dashboard-unit-count">10</span>
            </div>
            <div className="dashboard-unit-item">
              <span>Bank</span> <span className="dashboard-unit-count">7</span>
            </div>
            <div className="dashboard-unit-item">
              <span>Hospital</span> <span className="dashboard-unit-count">3</span>
            </div>
          </div>
        </div>
      </div>
      {/* status of fire extinguisher show data */}
      <div className="dashboard-containerBottom">
        <div className="dashboard-status-card">
          <h2 className="dashboard-status-title">Status of Fire Extinguishers</h2>
          <div className="dashboard-status-content">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={data}>
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
