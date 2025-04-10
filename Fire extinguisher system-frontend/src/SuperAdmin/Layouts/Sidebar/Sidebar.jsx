import './Sidebar.css';
import { useEffect } from 'react';

function Sidebar() {
    useEffect(() => {
        // ตรวจสอบ URL ปัจจุบัน
        const currentPath = window.location.pathname;

        // ลบคลาส 'activeLink' ทั้งหมด
        const links = document.querySelectorAll('.sidebarContainer a');
        links.forEach(link => link.classList.remove('activeLink'));

        // เพิ่มคลาส 'activeLink' ให้กับลิงก์ที่ตรงกับ URL ปัจจุบัน
        const activeLink = document.querySelector(`.sidebarContainer a[href="${currentPath}"]`);
        if (activeLink) {
            activeLink.classList.add('activeLink');
        }
    }, []); // การทำงานครั้งเดียวเมื่อ component mount

    return ( 
        <div className='sidebarContainer'>
            <a href="/dashboard" className='dashboardSB'>Dashboard</a>
            <a href="/manageuser"  className='manageuserSB'>Manage User</a>
            <a href="/manageunit" className='manageunitSB'>Manage Unit</a>
        </div>
     );
}

export default Sidebar;
