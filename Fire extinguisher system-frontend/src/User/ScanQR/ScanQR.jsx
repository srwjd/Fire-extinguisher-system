import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import './ScanQR.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ScanQR() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            if (
                webcamRef.current &&
                webcamRef.current.video &&
                webcamRef.current.video.readyState === 4 &&
                scanning
            ) {
                const video = webcamRef.current.video;
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    const scannedData = code.data;
                    setScanning(false); // หยุดสแกน

                    try {
                        const url = new URL(scannedData);
                        const parts = url.pathname.split('/');
                        const fireID = parts[parts.length - 1];
                        if (!isNaN(fireID)) {
                            navigate(`/fire-details/${fireID}`);
                        }
                    } catch {
                        if (!isNaN(scannedData)) {
                            navigate(`/fire-details/${scannedData}`);
                        } else {
                            alert("QR Code ไม่ถูกต้อง");
                            setScanning(true); // สแกนใหม่ถ้า QR ไม่ถูก
                        }
                    }
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, [scanning, navigate]);

    return (
        <div className="qrScreen">
            <div className="qrContainer">
                <Link to="/home">
                    <span className='back'>
                        <FaArrowLeft size={30} />
                    </span>
                </Link>
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'environment' }}
                    className="qrCamera"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="qrOverlay" />
            </div>
        </div>
    );
}

export default ScanQR;