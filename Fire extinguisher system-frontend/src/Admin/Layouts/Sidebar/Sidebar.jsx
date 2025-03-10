import './Sidebar.css';

import { Link } from 'react-router';

function Sidebar() {
    return ( 
        <div className='sidebarContainer'>
            <Link to="/inspection" style={{color: "#000000"}}>Inspection</Link>
            <Link to="/checkwork" style={{color: "#000000"}}>Checkwork</Link>
            <Link to="/report" style={{color: "#000000"}}>Report</Link>
            <Link to="/assignhistory" style={{color: "#000000"}}>Assign History</Link>
        </div>
     );
}

export default Sidebar;