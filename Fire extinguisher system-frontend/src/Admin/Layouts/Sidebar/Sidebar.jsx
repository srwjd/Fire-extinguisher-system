import './Sidebar.css';

import { Link } from 'react-router';

function Sidebar() {
    return ( 
        <div className='sidebarContainer'>
            <Link to="/inspection" className='dashboardSB'>Inspection</Link>
            <Link to="/checkwork" className='dashboardSB'>Checkwork</Link>
            <Link to="/report" className='dashboardSB'>Report</Link>
            <Link to="/assignhistory" className='dashboardSB'>Assign History</Link>
        </div>
     );
}

export default Sidebar;