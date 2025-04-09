import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import "./ManageUnit.css";

const ManageUnit = () => {
  const [units, setUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUnit, setEditUnit] = useState(null);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [newCompany, setNewCompany] = useState({
    company_name: "",
    branch_name: "",
    quantity: "",
  });

  const unitsPerPage = 5;

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/fire/getAllUnit"
        );
        setUnits(response.data);
      } catch (error) {
        console.error("Error fetching units data :", error);
      }
    };

    fetchUnits();
  }, []);

  useEffect(() => {
    const uniqueCompanies = [
      ...new Set(units.map((unit) => unit.company_name)),
    ];
    const uniqueBranches = [...new Set(units.map((unit) => unit.branch_name))];

    setCompanyOptions(
      uniqueCompanies.map((name) => ({ label: name, value: name }))
    );
    setBranchOptions(
      uniqueBranches.map((name) => ({ label: name, value: name }))
    );
  }, [units]);

  // Filter units based on the search term
  const filteredUnits = units.filter((unit) =>
    `${unit.company_name} ${unit.branch_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Get current units based on the current page
  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);

  // Calculate total pages
  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage);

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to handle adding a company
  const handleAddCompany = async () => {
    if (!newCompany.company_name || !newCompany.branch_name) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/fire/addCompany",
        newCompany
      );

      if (response.data) {
        const { company_id, branch_id, fire_count } = response.data;

        alert("Company and branch added successfully!");

        // Update the units array with new branch and fire count
        setUnits((prevUnits) => [
          ...prevUnits,
          {
            company_id,
            branch_id,
            company_name: newCompany.company_name,
            branch_name: newCompany.branch_name,
            fire_count, // Add this field to track fire extinguisher count per branch
          },
        ]);

        // Clear form
        setNewCompany({
          company_name: "",
          branch_name: "",
          quantity: "",
        });
      } else {
        alert("Error: No valid response from server.");
      }
    } catch (error) {
      console.error(
        "Error adding unit:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to add unit. Please try again.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editUnit.branch_name) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // ส่งข้อมูลไปยัง backend เพื่อแก้ไขข้อมูลในฐานข้อมูล
      const response = await axios.put(
        `http://localhost:3000/fire/editCompany/${editUnit.company_id}/${editUnit.branch_id}`,
        {
          branch_name: editUnit.branch_name, // ส่งเฉพาะข้อมูลที่แก้ไข
          // quantity: editUnit.fire_count, // ✨ ส่ง quantity ไป backend
        }
      );

      if (response.data) {
        alert("Company and branch updated successfully!");

        // อัปเดตข้อมูลใน UI หลังจากที่ทำการแก้ไขสำเร็จ
        setUnits((prevUnits) =>
          prevUnits.map((unit) =>
            unit.company_id === editUnit.company_id &&
            unit.branch_id === editUnit.branch_id
              ? {
                  ...unit,
                  branch_name: editUnit.branch_name, // อัปเดตชื่อ branch ที่ถูกแก้ไข
                }
              : unit
          )
        );

        setEditUnit(null); // รีเซ็ตสถานะการแก้ไข
      } else {
        alert("Error: No valid response from server.");
      }
    } catch (error) {
      console.error(
        "Error updating company:",
        error.response?.data || error.message
      );
      alert("Failed to update company. Please try again.");
    }
  };

  const handleEdit = (unit) => {
    if (!unit.branch_id) {
      console.warn("branch_id is missing, generating fake id");
      unit.branch_id = unit.branch_name ? unit.branch_name.length : 0; // ใช้วิธีสร้าง branch_id ชั่วคราว
    }
    console.log("Edit Unit:", unit);
    setEditUnit({ ...unit });
  };

  const handleEditChange = (e) => {
    setEditUnit({
      ...editUnit,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (unitId) => {
    // ถามผู้ใช้ก่อนลบข้อมูล
    if (!window.confirm("Are you sure you want to delete this unit?")) return;

    try {
      // ใช้ `branch_id` แทน `unit_id` ในการลบ
      const response = await axios.delete(
        `http://localhost:3000/fire/deleteBranchAndFires/${unitId}`
      );

      if (response.data) {
        alert("Unit deleted successfully.");
        // ลบหน่วยงานที่มี `branch_id` ตรงกับ `unitId`
        setUnits((prevUnits) =>
          prevUnits.filter((unit) => unit.branch_id !== unitId)
        );
      } else {
        alert("Error: No valid response from server.");
      }
    } catch (error) {
      console.error(
        "Error deleting unit:",
        error.response?.data || error.message
      );
      alert("Failed to delete unit. Please try again.");
    }
  };

  return (
    <div className="manage-unit-allpage">
      <div className="manage-unit-container">
        {/* Add Unit Section */}
        <div className="add-unit">
          <div className="add-unit-header">
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              Add Unit
            </span>
          </div>
          <div className="add-unit-body">
            <div className="manage-unit-form-group">
              <label>Company Name :</label>
              <CreatableSelect
                isClearable
                options={companyOptions}
                onChange={(selected) =>
                  setNewCompany({
                    ...newCompany,
                    company_name: selected?.value || "",
                  })
                }
                value={
                  newCompany.company_name
                    ? {
                        label: newCompany.company_name,
                        value: newCompany.company_name,
                      }
                    : null
                }
                placeholder="Type or select company name"
              />
            </div>
            <div className="manage-unit-form-group">
              <label>Branch Name :</label>
              <CreatableSelect
                isClearable
                options={branchOptions}
                onChange={(selected) =>
                  setNewCompany({
                    ...newCompany,
                    branch_name: selected?.value || "",
                  })
                }
                value={
                  newCompany.branch_name
                    ? {
                        label: newCompany.branch_name,
                        value: newCompany.branch_name,
                      }
                    : null
                }
                placeholder="Type or select branch name"
              />
            </div>
            <div className="manage-unit-form-group">
              <label>Quantity :</label>
              <input
                type="number"
                name="quantity"
                value={newCompany.quantity}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, quantity: e.target.value })
                }
              />
            </div>
            <button className="confirm-add-unit-btn" onClick={handleAddCompany}>
              Confirm
            </button>
          </div>
        </div>

        {/* Manage Unit Section */}
        <div className="manage-unit-container">
          <div className="manage-unit-header">
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              Manage Unit
            </span>
          </div>
          <div className="manage-unit-body">
            {/* Search Bar */}
            <div className="manage-unit-search-bar">
              <FaSearch className="manage-unit-search-icon" />
              <input
                type="text"
                placeholder="Search : Company Name , Branch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Units Table */}
            <div className="manage-unit-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Branch</th>
                    <th>Quantity</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUnits.map((unit, index) => (
                    <tr key={index}>
                      <td>{unit.company_name}</td>
                      <td>{unit.branch_name}</td>
                      <td>{unit.fire_count || 0}</td>{" "}
                      {/* แสดงเฉพาะ fire_count ของ branch */}
                      <td>
                        <FaEdit
                          className="manage-user-edit-icon"
                          onClick={() => handleEdit(unit)}
                        />
                      </td>
                      <td>
                        <FaTrash
                          className="manage-user-delete-icon"
                          onClick={() => handleDelete(unit.branch_id)} // ส่ง `branch_id` แทน `unit_id`
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="manage-unit-pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || totalPages === 0}
              >
                &lt;
              </button>
              <span>
                {currentPage} out of {totalPages > 0 ? totalPages : 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                &gt;
              </button>
            </div>

            <hr />

            {/* Edit Section */}
            {editUnit && (
              <div className="unit-details">
                {/* <h3 className="edit-unit-title">Edit Unit ID : {editUnit.unit_id}</h3> */}
                <div className="manage-unit-form-group">
                  <label>Company Name :</label>
                  <input
                    type="text"
                    name="company_name"
                    value={editUnit?.company_name}
                    disabled // ปิดการแก้ไข
                  />
                </div>
                <div className="manage-unit-form-group">
                  <label>Branch Name :</label>
                  <input
                    type="text"
                    name="branch_name"
                    value={editUnit?.branch_name}
                    onChange={handleEditChange}
                  />
                </div>
                {/* <div className="manage-unit-form-group">
                  <label>Add Quantity :</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editUnit.quantity || ""}
                    onChange={(e) =>
                      setEditUnit({
                        ...editUnit,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div> */}

                <button
                  className="confirm-manage-unit-btn"
                  onClick={handleSaveEdit}
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUnit;
