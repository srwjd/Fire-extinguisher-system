import React, { useState } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUnit.css";

const ManageUnit = () => {
  const [units, setUnits] = useState([
    {
      id: "00001",
      corpType: "Bank",
      corpName: "SCB",
      branch: "Sripatum U",
      quantity: 5,
      corpPhone: "01111111111",
      branchPhone: "0222222222",
      fexSN:
        "NFPA 10-0001, NFPA 10-2002, NFPA 10-2003, NFPA 10-2004, NFPA 10-2005",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <div className="manage-unit-container">
        <div className="add-unit">
          <div className="add-unit-header">
            <span>Add Unit</span>
          </div>
          <div className="add-unit-body">
            <div className="form-group">
              <label>Company Name :</label>
              <input type="text" placeholder="เช่น SCB" />
            </div>
            <div className="form-group">
              <label>Branch :</label>
              <input type="text" placeholder="เช่น Sripatum U" />
            </div>
            <div className="form-group">
              <label>Quantity :</label>
              <input type="number" />
            </div>
            <div className="form-group">
              <label>Phone Company :</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>Phone Branch :</label>
              <input type="text" />
            </div>
            <button className="confirm-btn">Confirm</button>
          </div>
        </div>

        <div className="manage-unit-container">
          <div className="manage-unit-header">
            <span>Manage Unit</span>
          </div>
          <div className="manage-unit-body">
            <div className="manage-unit-search-bar">
              <FaSearch className="manage-unit-search-icon" />
              <input
                type="text"
                placeholder="Search : Corp Name , Branch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="manage-unit-table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Corp Name</th>
                    <th>Branch</th>
                    <th>Quantity</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id}>
                      <td>{unit.id}</td>
                      <td>{unit.corpName}</td>
                      <td>{unit.branch}</td>
                      <td>{unit.quantity}</td>
                      <td>
                        <FaEdit
                          className="manage-user-edit-icon"
                          onClick={() => handleEdit(user)}
                        />
                      </td>
                      <td>
                        <FaTrash
                          className="manage-user-delete-icon"
                          onClick={() => handleDelete(user.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <hr />
            <div className="unit-details">
            <div className="manage-unit-form-group">
              <label>Phone Company :</label>
              <input type="text" name="Phone Company"/>
            </div>
            <div className="manage-unit-form-group">
              <label>Phone Branch :</label>
              <input type="text" name="Phone Branch"/>
            </div>
            <div className="manage-unit-form-group">
              <label>Quantity :</label>
              <input type="number" name="Quantity"/>
            </div>
            <div className="manage-unit-form-group">
              <label>Fex S/N :</label>
              <input type="text" name="Fex S/N"/>
            </div>
              <button className="confirm-btn">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUnit;
