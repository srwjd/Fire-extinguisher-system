import './Fire_details.css';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft } from "react-icons/fa";

function FireDetails() {
  const { fire_id } = useParams();
  const [fire, setFire] = useState(null);
  const userID = localStorage.getItem('userID');
  const [inspectionMore, setInspectionMore] = useState('');
  const [inspectionData, setInspectionData] = useState({
    condition_ok: false,
    pressure_ok: false,
    nozzle_clear: false,
    pin_sealed: false,
    placement_correct: false
  });

  useEffect(() => {
    const fetchFireDetails = async () => {
      try {
        const reportResponse = await axios.get(`http://localhost:3000/fire/getreports/${userID}`);
        const fireReport = reportResponse.data.result.find(fire => fire.fire_id === parseInt(fire_id));

        const fireResponse = await axios.get(`http://localhost:3000/fire/getfire/${fire_id}`);

        if (fireReport && fireResponse.data.result.length > 0) {
          const formattedDate = new Date(fireReport.date).toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          setFire({
            ...fireResponse.data.result[0],
            description: fireReport.description,
            timeReported: formattedDate,
            assign_id: fireReport.assign_id
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchFireDetails();
  }, [userID, fire_id]);

  const handleSubmit = () => {
    const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const time = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })


    axios.put(`http://localhost:3000/fire/insertinspection/${fire_id}`, {
      fire_id: fire_id,
      filename: "ยังไม่มีไฟล์",
      description: inspectionMore,
      date: formattedDate,
      time: time,
      user_id: userID,
      assign_id: fire.assign_id,
      condition_ok: inspectionData.condition_ok,
      pressure_ok: inspectionData.pressure_ok,
      nozzle_clear: inspectionData.nozzle_clear,
      pin_sealed: inspectionData.pin_sealed,
      placement_correct: inspectionData.placement_correct
    }).then(() => {
      axios.post(`http://localhost:3000/fire/updatestatus`, {
        fire_id: fire_id
      })
    }).then(() => {
      alert("บันทึกผลการตรวจสอบเรียบร้อย");
      window.history.back();
    }).catch(error => {
      console.error("Error saving inspection:", error);
    });
  };

  return (
    <div className="fireDetailsContainer">
      <span className='back'>
        <FaArrowLeft onClick={() => window.history.back()} size={30} />
      </span>
      {fire && (
        <div style={{
          maxHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          width: '100%'
        }}>
          <div className="fireReportContainer">
            <div className="fireReportContent">
              <div className="fireReportImgContainer">
                <div className="fireImageContainer">
                </div>
              </div>

              <p>S/N : {fire.serial_number}</p>
              <p>Location : {fire.company_name}, {fire.branch_name}</p>
              <p>Reported Date : {fire.timeReported}</p>
              <p>Description : {fire.description}</p>
            </div>
          </div>

          <div className="fireInspectionContainer">
            <div className="fireInspectionImgContainer">
              <div className="fireInspectionImg">
              </div>
            </div>
            <div className="fireInspectionContent">
              <table>
                <tbody>
                  <tr>
                    <td><p>สภาพของถังไม่เสียหาย</p></td>
                    <td><input type="checkbox" className='checkbox' checked={inspectionData.condition_ok} onChange={(e) => setInspectionData({ ...inspectionData, condition_ok: e.target.checked })} /></td>
                  </tr>
                  <tr>
                    <td><p>ความดันของถังอยู่ในระดับที่เหมาะสม</p></td>
                    <td><input type="checkbox" className='checkbox' checked={inspectionData.pressure_ok} onChange={(e) => setInspectionData({ ...inspectionData, pressure_ok: e.target.checked })} /></td>
                  </tr>
                  <tr>
                    <td><p>หัวฉีดและวาล์วไม่อุดตัน</p></td>
                    <td><input type="checkbox" className='checkbox' checked={inspectionData.nozzle_clear} onChange={(e) => setInspectionData({ ...inspectionData, nozzle_clear: e.target.checked })} /></td>
                  </tr>
                  <tr>
                    <td><p>สลักนิรภัยและซีลป้องกันไม่ถูกดึงออก</p></td>
                    <td><input type="checkbox" className='checkbox' checked={inspectionData.pin_sealed} onChange={(e) => setInspectionData({ ...inspectionData, pin_sealed: e.target.checked })} /></td>
                  </tr>
                  <tr>
                    <td><p>ตำแหน่งการติดตั้งเหมาะสม</p></td>
                    <td><input type="checkbox" className='checkbox' checked={inspectionData.placement_correct} onChange={(e) => setInspectionData({ ...inspectionData, placement_correct: e.target.checked })} /></td>
                  </tr>
                </tbody>
              </table>

              <div className="fireInspectionMoreContainer">
                <div className="fireInspectionMoreContent">
                  <p>หมายเหตุ</p>
                  <textarea
                    onChange={(e) => setInspectionMore(e.target.value)}
                    value={inspectionMore}
                    className='fireInspectionMore'
                    placeholder="หมายเหตุ"
                  />
                </div>
              </div>
            </div>
            <div className="fireSubmitContainer">
              <button className="fireSubmit" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FireDetails;