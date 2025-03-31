import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function ReportDetail() {
    const navigate = useNavigate();
    const { fire_id } = useParams(); // ดึง fire_id จาก URL
    const [fire, setFire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [description, setDescription] = useState(""); // เก็บค่าหมายเหตุ
    const [file, setFile] = useState(null);
    const userID = localStorage.getItem("userID");

    useEffect(() => {
        if (!fire_id) {
            console.error("fire_id is undefined");
            return;
        }
    
        axios
            .get(`http://localhost:3000/fire/fire/${fire_id}`)
            .then((response) => {
                console.log(response.data); // ตรวจสอบข้อมูลที่ได้รับ
                setFire(response.data); // ตั้งค่าข้อมูลของ fire
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching fire details:", error);
                setLoading(false);
            });
    
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
    
        return () => clearInterval(interval);
    }, [fire_id]);

    const handleReportSubmit = async () => {
        if (!fire || !userID || !file) {
            alert("ไม่สามารถบันทึกรายงานได้ กรุณาลองใหม่");
            return;
        }
    
        const formData = new FormData();
        formData.append("filename", file);
        formData.append("description", description);
        formData.append("date", currentTime.toISOString().split("T")[0]); // YYYY-MM-DD
        formData.append("time", currentTime.toTimeString().split(" ")[0]); // HH:MM:SS
        formData.append("fire_id", fire_id);
        formData.append("user_id", userID);
    
        console.log("Report Data Sent:", formData);
    
        try {
            const response = await axios.post("http://localhost:3000/fire/reports", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("บันทึกข้อมูลเรียบร้อยแล้ว");
            navigate(-1); // กลับไปหน้าก่อนหน้า
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกรายงาน");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>Report Detail</h1>
            {fire ? (
                <>
                    <button onClick={() => navigate(-1)}>Back</button>
                    <br />

                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                                        
                    <input
                        type="text"
                        placeholder="หมายเหตุ: "
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <p><strong>Date:</strong> {currentTime.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {currentTime.toLocaleTimeString()}</p>
                    <p><strong>S/N : </strong> {fire[0].serial_number}</p>

                    <button onClick={handleReportSubmit}>Report</button>
                </>
            ) : (
                <p>ไม่พบข้อมูลถังดับเพลิง</p>
            )}
        </div>
    );
}

export default ReportDetail;
