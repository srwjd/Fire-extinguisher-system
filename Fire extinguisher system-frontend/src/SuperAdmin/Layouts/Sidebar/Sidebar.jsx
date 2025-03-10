import './Sidebar.css';

import { Link } from 'react-router';

function Sidebar() {
    return ( 
        <div className='sidebarContainer'>
            <Link to="/dashboard" style={{color: "#000000"}}>Dashboard</Link>
            <Link to="/manageuser" style={{color: "#000000"}}>Manage User</Link>
            <Link to="/manageunit" style={{color: "#000000"}}>Manage Unit</Link>
        </div>
     );
}

export default Sidebar;