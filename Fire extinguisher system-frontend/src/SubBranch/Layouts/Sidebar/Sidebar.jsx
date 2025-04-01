import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
    const location = useLocation();

    return (
        <div className='sidebarContainer'>
            <Link 
                to="/home" 
                className={location.pathname === "/home" ? "activeLink" : ""}
            >
                Home
            </Link>
            <Link 
                to="/report" 
                className={location.pathname === "/report" ? "activeLink" : ""}
            >
                Report
            </Link>
        </div>
    );
}

export default Sidebar;
