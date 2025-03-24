import './Sidebar.css';

import { Link } from 'react-router';

function Sidebar() {
    return (
        <div className='sidebarContainer'>
            <Link to="/home" style={{ color: "#000000" }}>Home</Link>
            <Link to="/report" style={{ color: "#000000" }}>Report</Link>
            <Link to="/test" style={{ color: "#000000" }}>Test</Link>
        </div>
    );
}

export default Sidebar;