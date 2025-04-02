import './Sidebar.css';

import { Link } from 'react-router';

function Sidebar() {
    return (
        <div className='sidebarContainer'>
            <Link to="/home" className='dashboardSB'>Home</Link>
            <Link to="/report" className='dashboardSB'>Report</Link>
            
        </div>
    );
}

export default Sidebar;