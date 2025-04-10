import './Sidebar.css';
import { Link } from 'react-router';
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
            <a href="/home" className='dashboardSB'>Home</a>
            <a href="/report" className='dashboardSB'>Report</a>
            
        </div>
    );
}

export default Sidebar;