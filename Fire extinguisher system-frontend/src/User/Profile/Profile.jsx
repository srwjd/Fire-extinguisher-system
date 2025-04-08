import { useState } from 'react';

import './Profile.css'
import Bar from '../Layouts/Bar/Bar';


function Profile() {
    const [isEditName, setIsEditName] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('branchId');
        localStorage.removeItem('companyId');
        localStorage.removeItem('userID');
        window.location.href = '/';
    }; 
    
    return (
        <div className='profileContainer'>
            <div className='profileContent'>
                <div className='profileTitle'>
                    <h1>Profile</h1>
                </div>
                <div className='profileImage'>
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="" />
                </div>
                <div className='profileNameContainer'>
                    <div className='profileName'>
                        <h2>John Doe</h2>
                    </div>
                    <div
                        className='iconEditName'
                        onClick={() => setIsEditName(true)}
                    >
                        <span className="fi fi-rr-pencil"></span>
                    </div>
                </div>
                <div className='profileDetails'>

                </div>
                <div className='profileLogout'>
                    <button
                        className='logoutButton'
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {isEditName && (
                <div className='formEditName'>
                    <input type="text" placeholder="Enter new name" />
                    <button onClick={() => setIsEditName(false)}>Save</button>
                </div>
            )}

            <div className='barProfile'>
                <Bar />
            </div>
        </div>
    );
}

export default Profile;