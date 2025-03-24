import axios from 'axios';
import { useState, useEffect } from 'react';
import './Home.css'

function Home() {
    const [branches, setBranches] = useState([]);
    const [fires, setFires] = useState([]);
    const companyId = localStorage.getItem('companyId');

    useEffect(() => {
        if (!companyId) {
            console.error("No companyId found in localStorage");
            return;
        }

        // ดึงข้อมูล branches และ fires
        axios.get(`http://localhost:3000/fire/company/${companyId}`)
            .then(response => {
                setBranches(response.data.branches);
                setFires(response.data.fires);
                console.log("Branches:", response.data);
            })
            .catch(error => {
                console.error("Error fetching branches:", error);
            });
    }, [companyId]);

    
    

    // ฟังก์ชันเพื่อคำนวณจำนวนถังดับเพลิงในแต่ละสาขา
    const getFireCountForBranch = (branchId) => {
        return fires.filter(fire => fire.branch_id === branchId).length;
    };

    return (
        <div>
            
            <h3 className='Text-MainBranch'>Main-branch</h3>
            <table className='Table-MainBranch' >
                <thead>
                    <tr>
                        <th>Branch ({branches.length})</th>
                        <th>Fire extinguisher</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {branches.map(branch => (
                        <tr key={branch.branch_id}>
                            <td>{branch.branch_name}</td>
                            <td>{getFireCountForBranch(branch.branch_id)}</td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Home;
