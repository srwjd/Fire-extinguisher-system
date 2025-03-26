import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Inspection.css';

function Inspection() {
  const [inspectionData, setInspectionData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    // Fetch inspection data on component mount
    const fetchInspectionData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/fire/inspec');
        if (Array.isArray(response.data)) {
          setInspectionData(response.data);  // Set data if it's an array
        } else {
          console.error('Response data is not an array', response.data);
        }
      } catch (error) {
        console.error('Error fetching inspection data:', error);
      }
    };

    fetchInspectionData();
  }, []);  // Empty dependency array ensures it runs only once when the component mounts

  const handleSearch = (e) => {
    const term = e.target.value.toLocaleLowerCase();
    setSearchTerm(term);

    if (!term) {
        setFilteredReport(report);
    } else {
        setFilteredReport(
            report.filter((item) => {
                const serial = item.serial_number ? String(item.serial_number).toLocaleLowerCase() : "";
                const user = item.user_id ? String(item.user_id).toLocaleLowerCase() : "";
                return serial.includes(term) || user.includes(term);
            })
        );
    }
};

  return (
    <div className='inspection-Container'>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>MFD</th>
              <th>EXP</th>
              <th>Last check</th>
              <th>Next check</th>
            </tr>
          </thead>
          <tbody>
            {/* Render rows dynamically from the state */}
            {Array.isArray(inspectionData) && inspectionData.length > 0 ? (
              inspectionData.map((item, index) => (
                <tr key={index}>
                  <td>{item.serial_number}</td>
                  <td>{item.fire_mfd.split("T")[0]}</td>
                  <td>{item.fire_exp.split("T")[0]}</td>
                  <td>{item.latest_check.split("T")[0]}</td>
                  <td>{item.next_check.split("T")[0]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination">
          <button>{"<"}</button>
          <div>1 out of 10</div>
          <button>{">"}</button>
        </div>
        <div className="form-container">
          <label>
            <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Search by ID or S/N" 
                        value={searchTerm} 
                        onChange={handleSearch}
                    />
                </div>&nbsp;&nbsp;&nbsp;
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Search by User" 
                        value={searchTerm} 
                        onChange={handleSearch}
                    />
                </div>
          </label>
          
          <button className="assign-button">Assign</button>
        </div>
      </div>
    </div>
  );
}

export default Inspection;
