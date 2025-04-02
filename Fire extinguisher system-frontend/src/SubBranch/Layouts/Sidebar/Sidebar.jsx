import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebarContainer">
      {/* <Link to="/home" className="dashboardSB">
        Home
      </Link> */}
      <Link to="/report" className="dashboardSB">
        Report
      </Link>
    </div>
  );
}

export default Sidebar;
