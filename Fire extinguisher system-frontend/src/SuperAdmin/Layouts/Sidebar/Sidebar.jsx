import './Sidebar.css';

import { Link } from 'react-router';

function Sidebar() {
    return ( 
        <div className='sidebarContainer'>
            <Link to="/dashboard" className='dashboardSB'>Dashboard</Link>
            <Link to="/manageuser"  className='manageuserSB'>Manage User</Link>
            <Link to="/manageunit" className='manageunitSB'>Manage Unit</Link>
        </div>
     );
}

export default Sidebar;