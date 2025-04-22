import { useEffect, useState } from "react";
import axios from "axios";
import { TbReportSearch } from "react-icons/tb";
import "./Report.css";

function Report() {
  const [branchId, setBranchId] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const storedBranchId = localStorage.getItem("branchId");
    if (storedBranchId) {
      setBranchId(storedBranchId);
    }
  }, []);

  useEffect(() => {
    if (!branchId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/fire/branches/${branchId}`
        );
        if (res.data.branch) {
          setData(res.data.branch);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [branchId]);

  return (
    <div style={{height: '90vh', overflow: 'auto'}}>
      <div className="reportTable">
        <table className="tableContainer">
          <thead className="tableHeaderSubBranch">
            <tr>
              <td style={{ textAlign: "center" }}>S/N</td>
              <td style={{ textAlign: "center" }}>MFD</td>
              <td style={{ textAlign: "center" }}>EXP</td>
              <td style={{ textAlign: "center" }}>Last check</td>
              <td style={{ textAlign: "center" }}>Next check</td>
              <td style={{ textAlign: "center" }}>Status</td>
              <td style={{ textAlign: "center" }}>Report</td>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((fire, index) => (
                <tr key={index}>
                  <td>{fire.serial_number}</td>
                <td>{fire.fire_mfd.split("T")[0]}</td>
                <td>{fire.fire_exp.split("T")[0]}</td>
                <td>
                  {fire.latest_check ? fire.latest_check.split("T")[0] : "N/A"}
                </td>
                <td>
                  {fire.next_check ? fire.next_check.split("T")[0] : "N/A"}
                </td>
                <td>{fire.status}</td>
                  <td>
                    <a
                      href={`/report/${fire.fire_id}`}
                      style={{
                        color: "#000000",
                        fontSize: "20px",
                        textAlign: "center",
                      }}
                    >
                      <TbReportSearch />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Report;
