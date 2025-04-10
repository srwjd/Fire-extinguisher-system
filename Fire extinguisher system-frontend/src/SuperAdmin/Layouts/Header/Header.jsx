import './Header.css';
import { FaRegCircleUser } from "react-icons/fa6";
import { TbLogout2 } from "react-icons/tb";
import { useState } from 'react';

function Header() {
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login"; // กลับไปหน้า login
    };

    return (
        <div className='headerContainer'>
            <div className='logo'></div>
            <div className='title' onClick={() => setShowMenu(!showMenu)} style={{ position: 'relative', cursor: 'pointer' }}>
                <FaRegCircleUser size={50} />
                <div>Super Admin</div>
                {showMenu && (
                    <div className="dropdownMenu">
                        <div className="dropdownItem" onClick={handleLogout}>
                        <TbLogout2 />  Logout
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
