import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUnit.css";

const ManageUnit = () => {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUnit, setEditUnit] = useState(null);
  const [newUnit, setNewUnit] = useState({
    company_name: "",
    branch: "",
    quantity: "",
    compPhone: "",
    branchPhone: "",
    fexSN: "",
  });

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
  }, []); // Empty array means this effect runs once when the component mounts

  // ฟังก์ชันเพิ่มข้อมูล
  const handleAddUnit = () => {
    if (!newUnit.company_name || !newUnit.branch || !newUnit.quantity || !newUnit.compPhone) {
      alert("Please fill in all fields.");
      return;
    }

    const newEntry = {
      id: String(units.length + 1).padStart(5, "0"),
      ...newUnit,
    };

    setUnits([...units, newEntry]);
    setNewUnit({
      company_name: "",
      branch: "",
      quantity: "",
      compPhone: "",
      branchPhone: "",
      fexSN: "",
    });
  };

  // ฟังก์ชันเลือกหน่วยที่ต้องการแก้ไข
  const handleEdit = (unit) => {
    setEditUnit({ ...unit });
  };

  // ฟังก์ชันอัปเดตค่าที่แก้ไข
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUnit({ ...editUnit, [name]: value });
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleSaveEdit = () => {
    if (!editUnit) return;
    setUnits(units.map((unit) => (unit.id === editUnit.id ? editUnit : unit)));
    setEditUnit(null);
  };

  // ฟังก์ชันลบข้อมูล
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setUnits(units.filter((unit) => unit.id !== id));
    }
  };

  return (
    <div className="manage-unit-container">
      {/* Add Unit Section */}
      <div className="add-unit">
        <div className="add-unit-header">
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>Add Unit</span>
        </div>
        <div className="add-unit-body">
          <div className="manage-unit-form-group">
            <label>Company Name :</label>
            <input
              type="text"
              placeholder="เช่น SCB"
              value={newUnit.company_name}
              onChange={(e) => setNewUnit({ ...newUnit, company_name: e.target.value })}
            />
          </div>
          <div className="manage-unit-form-group">
            <label>Branch :</label>
            <input
              type="text"
              placeholder="เช่น Sripatum U"
              value={newUnit.branch}
              onChange={(e) => setNewUnit({ ...newUnit, branch: e.target.value })}
            />
          </div>
          <div className="manage-unit-form-group">
            <label>Quantity :</label>
            <input
              type="number"
              value={newUnit.quantity}
              onChange={(e) => setNewUnit({ ...newUnit, quantity: e.target.value })}
            />
          </div>
          <div className="manage-unit-form-group">
            <label>Phone Company :</label>
            <input
              type="text"
              value={newUnit.compPhone}
              onChange={(e) => setNewUnit({ ...newUnit, compPhone: e.target.value })}
            />
          </div>
          <div className="manage-unit-form-group">
            <label>Phone Branch :</label>
            <input
              type="text"
              value={newUnit.branchPhone}
              onChange={(e) => setNewUnit({ ...newUnit, branchPhone: e.target.value })}
            />
          </div>
          <button className="confirm-add-unit-btn" onClick={handleAddUnit}>
            Confirm
          </button>
        </div>
      </div>

      {/* Manage Unit Section */}
      <div className="manage-unit-container">
        <div className="manage-unit-header">
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>Manage Unit</span>
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
                  <th>ID</th>
                  <th>Company Name</th>
                  <th>Branch</th>
                  <th>Quantity</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {units
                  .filter((unit) =>
                    `${unit.company_name} ${unit.branch}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((unit) => (
                    <tr key={unit.id}>
                      <td>{unit.company_id}</td>
                      <td>{unit.company_name}</td>
                      <td>{unit.branch_name}</td>
                      <td>{unit.quantity}</td>
                      <td>
                        <FaEdit
                          className="manage-user-edit-icon"
                          onClick={() => handleEdit(unit)}
                        />
                      </td>
                      <td>
                        <FaTrash
                          className="manage-user-delete-icon"
                          onClick={() => handleDelete(unit.id)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <hr />

          {/* Edit Section */}
          {editUnit && (
            <div className="unit-details">
              <h3 className="edit-unit-title">Edit Unit ID : {editUnit.id}</h3>
              <div className="manage-unit-form-group">
                <label>Phone Company :</label>
                <input
                  type="text"
                  name="compPhone"
                  value={editUnit.compPhone}
                  onChange={handleEditChange}
                />
              </div>
              <div className="manage-unit-form-group">
                <label>Phone Branch :</label>
                <input
                  type="text"
                  name="branchPhone"
                  value={editUnit.branchPhone}
                  onChange={handleEditChange}
                />
              </div>
              <div className="manage-unit-form-group">
                <label>Quantity :</label>
                <input
                  type="number"
                  name="quantity"
                  value={editUnit.quantity}
                  onChange={handleEditChange}
                />
              </div>
              <div className="manage-unit-form-group">
                <label>Fex S/N :</label>
                <input
                  type="text"
                  name="fexSN"
                  value={editUnit.fexSN}
                  onChange={handleEditChange}
                />
              </div>
              <button className="confirm-manage-unit-btn" onClick={handleSaveEdit}>
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUnit;
