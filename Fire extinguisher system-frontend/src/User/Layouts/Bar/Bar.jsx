import './Bar.css'

import { Link } from 'react-router';

import { GoHome } from 'react-icons/go';
import { RiQrScan2Line } from 'react-icons/ri';
import { HiOutlineUserCircle } from 'react-icons/hi2';

function Bar() {
    return (
        <div className='barContainer'>
            <div className='barIcons'>
                <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className='homeIcon'>
                        <GoHome size={40} />
                        <span>
                            Home
                        </span>
                    </div>
                </Link>
                <div className='qrIcon'>
                    <RiQrScan2Line size={40} />
                </div>
                <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className='userIcon'>
                        <HiOutlineUserCircle size={40} />
                        Profile
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Bar;