import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import axios from "axios";
import "./ReportDetail.css";

function ReportDetail() {
    const navigate = useNavigate();
    const { fire_id } = useParams();
    const [fire, setFire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const userID = localStorage.getItem("userID");


    useEffect(() => {
        if (!fire_id) {
            console.error("fire_id is undefined");
            return;
        }

        axios
            .get(`http://localhost:3000/fire/fire/${fire_id}`)
            .then((response) => {
                console.log(response.data);
                setFire(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching fire details:", error);
                setLoading(false);
            });

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
    }, [fire_id, previewURL]); // 👈 ต้องใส่ previewURL ไว้ใน dependency ด้วย


    const handleReportSubmit = async () => {
        if (!fire || !userID || !file) {
            toast.error("Failed to save the report. Please try again.");
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
            toast.success("Issue reported successfully.");
            console.log("Report Response:", response.data);
            navigate(-1);
        } catch (error) {
            console.error("Error submitting report:", error);
            toast.error("Failed to report the issue. Please try again.");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ height: "90vh", overflow: "auto" }}>
            <button className="back-button" onClick={() => navigate(-1)}>Back</button>

            <div className="container">
                {fire ? (
                    <>
                        <div className="inputFile">
                            <input
                                
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const selectedFile = e.target.files[0];
                                    setFile(selectedFile);

                                    if (selectedFile) {
                                        setPreviewURL(URL.createObjectURL(selectedFile));
                                    }
                                }}
                            />
                            {previewURL && (
                                <div className="image-preview">
                                    <img src={previewURL} alt="Preview" style={{ maxWidth: "300px", marginTop: "10px" }} />
                                </div>
                            )}
                        </div>

                        <input className="inputText" type="text" placeholder="หมายเหตุ : " value={description} onChange={(e) => setDescription(e.target.value)} />

                        <p><strong>Date : </strong> {currentTime.toLocaleDateString()}</p>
                        <p><strong>Time : </strong> {currentTime.toLocaleTimeString()}</p>
                        <p><strong>S/N : </strong> {fire[0].serial_number}</p>

                        <button onClick={handleReportSubmit}>Report</button>
                    </>
                ) : (
                    <p>ไม่พบข้อมูลถังดับเพลิง</p>
                )}
            </div>
        </div>
    );
}

export default ReportDetail;
