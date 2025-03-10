import './Header.css';

import { FaRegCircleUser } from "react-icons/fa6";

function Header() {
    return (
        <div className='headerContainer'>
            <div className='logo'></div>
            <div className='title'>
                <FaRegCircleUser size={50} />
                Sub Branch
            </div>
        </div>
    );
}
export default Header;