import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUnit.css";

const ManageUnit = () => {
  const [units, setUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUnit, setEditUnit] = useState(null);
  const [newCompany, setNewCompany] = useState({
    company_name: "",
    branch_name: "",
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
        alert("Company added successfully!");

        // Update the units array to reflect the new company
        setUnits((prevUnits) => [
          ...prevUnits,
          {
            company_name: newCompany.company_name,
            branch_name: newCompany.branch_name,
          },
        ]);

        // Clear the form after adding successfully
        setNewCompany({
          company_name: "",
          branch_name: "",
        });
      } else {
        alert("Error: No valid response from server.");
      }
    } catch (error) {
      console.error("Error adding unit:", error.response ? error.response.data : error.message);
      alert("Failed to add unit. Please try again.");
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
              name="company_name"
              value={newCompany.company_name}
              onChange={(e) =>
                setNewCompany({ ...newCompany, company_name: e.target.value })
              }
            />
            <label>Branch Name :</label>
            <input
              type="text"
              name="branch_name"
              value={newCompany.branch_name}
              onChange={(e) =>
                setNewCompany({ ...newCompany, branch_name: e.target.value })
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
                {currentUnits.map((unit) => (
                  <tr key={unit.unit_id}>
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
                        onClick={() => handleDelete(unit.unit_id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="manage-unit-pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              &lt;
            </button>
            <span>
              {currentPage} out of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
          <hr />

          {/* Edit Section */}
          {editUnit && (
            <div className="unit-details">
              <h3 className="edit-unit-title">
                Edit Unit ID : {editUnit.unit_id}
              </h3>
              <div className="manage-unit-form-group">
                <label>Company Name :</label>
                <input
                  type="text"
                  name="company_name"
                  value={editUnit?.company_name}
                  onChange={handleEditChange}
                />
                <label>Branch Name :</label>
                <input
                  type="text"
                  name="branch_name"
                  value={editUnit?.branch_name}
                  onChange={handleEditChange}
                />
                <label>Quantity :</label>
                <input
                  type="number"
                  name="quantity"
                  value={editUnit?.quantity || ""}
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
  );
};

export default ManageUnit;
