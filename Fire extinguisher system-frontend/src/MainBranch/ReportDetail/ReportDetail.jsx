import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ReportDetail() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    return (
        <div>
            <h1>Report Detail</h1>
            <p>รายละเอียดของการ Report</p>
            
            {/* แสดงวันที่และเวลาปัจจุบันแบบเรียลไทม์ */}
            <p>Date: {currentTime.toLocaleDateString()}</p>
            <p>Time: {currentTime.toLocaleTimeString()}</p>

            <button onClick={() => navigate(-1)}>Back</button>
        </div>
    );
}

export default ReportDetail;
