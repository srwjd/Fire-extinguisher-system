/* eslint-disable react-hooks/exhaustive-deps */
// Home.js
import './Home.css';
import Bar from '../Layouts/Bar/Bar';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CiSearch } from 'react-icons/ci';
import { IoIosArrowDropright, IoIosArrowDropleft } from "react-icons/io";

function Home() {
    const [fireList, setFireList] = useState([]);
    const [fireIdList, setFireIdList] = useState([]);
    const [descriptionList, setDescriptionList] = useState([]); // เก็บ description แยก
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const itemsPerPage = 4;
    const userID = localStorage.getItem('userID');

    useEffect(() => {
        fetchFireIdList();
    }, []);

    useEffect(() => {
        if (fireIdList.length > 0) {
            fetchFireList();
        }
    }, [fireIdList]); // ทำงานเมื่อ fireIdList เปลี่ยนแปลง

    const fetchFireIdList = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/fire/getreports/${userID}`);
            if (response.data.result.length === 0) {
                return;
            }
            const idList = response.data.result.map((fire) => fire.fire_id);
            const descriptions = response.data.result.map((fire) => fire.description);
            setFireIdList(idList); // เก็บ fire_id
            setDescriptionList(descriptions); // เก็บ description แยก
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchFireList = async () => {
        try {
            const fireIds = fireIdList.join(',');
            const response = await axios.get(`http://localhost:3000/fire/getfire/${fireIds}`);

            // กรองเฉพาะ fire ที่มี status เป็น "report"
            const filteredFires = response.data.result.filter(fire => fire.status === "report");

            // เพิ่ม description ให้กับ fireList โดยการจับคู่ fire_id
            const fireListWithDescriptions = filteredFires.map(fire => {
                const description = descriptionList[fireIdList.indexOf(fire.fire_id)] || '';
                return { ...fire, description };
            });

            setFireList(fireListWithDescriptions);
        } catch (error) {
            setError(error.message);
        }
    };


    const filteredList = fireList.filter((fire) => {
        const serialNumber = fire.serial_number ? fire.serial_number.toLowerCase() : '';
        const company = fire.company ? fire.company.toLowerCase() : '';
        const branch = fire.branch ? fire.branch.toLowerCase() : '';
        const description = fire.description ? fire.description.toLowerCase() : '';

        return (
            serialNumber.includes(searchTerm.toLowerCase()) ||
            company.includes(searchTerm.toLowerCase()) ||
            branch.includes(searchTerm.toLowerCase()) ||
            description.includes(searchTerm.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    if (error) return <p>{error}</p>;

    return (
        <div className='homeContainer'>
            <div className='homeContent'>
                <div className='homeHeader'>
                    <div className='jacklogo'></div>
                    <div className='search'>
                        <CiSearch size={25} />
                        <input
                            type="text"
                            placeholder="ค้นหา"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                    </div>
                </div>

                <div className='cardContainer'>
                    {currentItems.length > 0 ? (
                        currentItems.map((fire) => (
                            <Link
                                to={`/fire-details/${fire.fire_id}`}
                                key={fire.fire_id}
                                className="fire-card-link"
                            >
                                <div className='card'>
                                    <span>S/N : {fire.serial_number || 'ไม่พบข้อมูล'}</span>
                                    <span>สถานที่ : {fire.company_name || 'ไม่พบข้อมูล'}, {fire.branch_name || 'ไม่พบข้อมูล'}</span>
                                    <span>หมายเหตุ : {fire.description || 'ไม่พบข้อมูล'}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center' }}>ไม่พบข้อมูลที่ค้นหา</p>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className='pagination'>
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <IoIosArrowDropleft size={25} />
                        </button>
                        <span>{currentPage} / {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <IoIosArrowDropright size={25} />
                        </button>
                    </div>
                )}
            </div>
            <div className='barHome'>
                <Bar />
            </div>
        </div>
    );
}

export default Home;
