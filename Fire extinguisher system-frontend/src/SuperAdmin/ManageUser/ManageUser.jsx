import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUser.css";

const AddUserForm = ({ isOpen, toggleForm, addUser, setUserList }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    surname: "",
    role: "",
    company_id: "",
    branch_id: "",
  });

  const [companys, setCompanys] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    // Fetch companys
    axios.get("http://localhost:3000/fire/companys").then((res) => {
      setCompanys(res.data);
    });
    // Fetch branches
    axios.get("http://localhost:3000/fire/branches").then((res) => {
      setBranches(res.data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      alert("Please select a role before adding.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/fire/addUser",
        formData
      );
      alert("User added successfully!");
      setUserList((prevUsers) => [
        ...prevUsers,
        { ...formData, id: Date.now().toString() },
      ]);
      setFormData({
        username: "",
        password: "",
        email: "",
        firstName: "",
        surname: "",
        role: "",
        company_id: "",
        branch_id: "",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user.");
    }
  };

  return (
    <div>
      <div className="manage-user-section-header" onClick={toggleForm}>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>Add User</span>
        <span className="manage-user-triangle">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="manage-user-form-container">
          <form onSubmit={handleSubmit}>
            <div className="manage-user-form-group">
              <label>Username :</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="manage-user-form-group">
              <label>Password :</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="manage-user-form-group">
              <label>Email :</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="manage-user-form-group">
              <label>First name :</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="manage-user-form-group">
              <label>Surname :</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>
            <div className="manage-user-form-group">
              <label>Role :</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">--- Select ---</option>
                <option value="SuperAdmin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="MainBranch">Main Branch</option>
                <option value="SubBranch">Sub Branch</option>
              </select>
            </div>

            {formData.role === "MainBranch" && (
              <div className="manage-user-form-group">
                <label>Company :</label>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">--- Select Company ---</option>
                  {companys.map((companys) => (
                    <option key={companys.company_id} value={companys.company_id}>
                      {companys.company_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.role === "SubBranch" && (
              <div className="manage-user-form-group">
                <label>Branch :</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">--- Select Branch ---</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="manage-user-confirmAddUser-button">
              Confirm
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const ManageUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [companys, setCompanys] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchCompanys = async () => {
      try {
        const response = await axios.get("http://localhost:3000/companys");
        setCompanys(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await axios.get("http://localhost:3000/branches");
        setBranches(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchCompanys();
    fetchBranches();
  }, []);

  // ดูรายชื่อ User
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/fire/showAllUser"
        );
        setUserList(response.data);
      } catch (error) {
        console.error("Error fetching user data :", error);
      }
    };

    fetchUsers();
  }, []);

  // ฟังก์ชันเพิ่ม User ใหม่
  const addUser = (newUser) => {
    // หา ID สูงสุดจาก userList และเพิ่ม 1
    const maxId =
      userList.length > 0
        ? Math.max(...userList.map((user) => parseInt(user.id)))
        : 0;
    newUser.id = (maxId + 1).toString().padStart(5, "0"); // ให้ ID เป็นตัวเลข 5 หลัก เช่น "00006"

    setUserList([...userList, newUser]);
  };

  const usersPerPage = 5;

  const filteredUsers = userList.filter(
    (user) =>
      (user.username?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.role?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  // const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const currentUsers = React.useMemo(() => {
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, indexOfFirstUser, indexOfLastUser]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleEdit = (user) => {
    setEditUser({
      id: user.user_id, // Ensure it matches your database ID field
      username: user.username,
      email: user.email,
      firstName: user.firstname || "", // Use correct field names
      surname: user.surname || "",
      role: user.role_name, // Ensure the correct role field
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser.role) {
      alert("Please select a role before saving.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/fire/updateUser/${editUser.id}`,
        editUser
      );
      alert("User updated successfully!");

      setUserList((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editUser.id ? { ...user, ...editUser } : user
        )
      );
      setEditUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3000/fire/deleteUser/${id}`);
        alert("User deleted successfully!");

        setUserList((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div
      className="manage-user-container"
      style={{
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <AddUserForm
        isOpen={isOpen}
        toggleForm={() => setIsOpen(!isOpen)}
        addUser={addUser}
        setUserList={setUserList} // <-- Ensure this is passed as a prop
      />

      <div className="manage-user-header">
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          Manage User
        </span>
      </div>
      <div className="manage-user-manageUserContainer">
        <div className="manage-user-search-bar">
          <FaSearch className="manage-user-search-icon" />
          <input
            type="text"
            placeholder="Search : username, email, name, role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="manage-user-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.user_id || `user-${index}`}>
                    <td>{user.user_id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.firstname} {user.surname}
                    </td>
                    <td>{user.role_name}</td>
                    <td>
                      <FaEdit
                        className="manage-user-edit-icon"
                        onClick={() => handleEdit(user)}
                      />
                    </td>
                    <td>
                      <FaTrash
                        className="manage-user-delete-icon"
                        onClick={() => handleDelete(user.user_id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    ไม่พบข้อมูลที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="manage-user-pagination">
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

        {editUser && (
          <div className="manage-user-edit-form-container">
            <hr />
            <h3>Edit User</h3>
            <form onSubmit={handleSave}>
              <div className="manage-user-form-group">
                <label>Username :</label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) =>
                    setEditUser({ ...editUser, username: e.target.value })
                  }
                />
              </div>
              <div className="manage-user-form-group">
                <label>Email :</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                />
              </div>
              <div className="manage-user-form-group">
                <label>First name :</label>
                <input
                  type="text"
                  value={editUser.firstName}
                  onChange={(e) =>
                    setEditUser({ ...editUser, firstName: e.target.value })
                  }
                />
              </div>
              <div className="manage-user-form-group">
                <label>Surname :</label>
                <input
                  type="text"
                  value={editUser.surname}
                  onChange={(e) =>
                    setEditUser({ ...editUser, surname: e.target.value })
                  }
                />
              </div>
              <div className="manage-user-form-group">
                <label>Role :</label>
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                >
                  <option value="">--- Select ---</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Main Branch">Main Branch</option>
                  <option value="Sub Branch">Sub Branch</option>
                </select>
              </div>
              <div className="manage-user-form-group">
                <label>Company :</label>
                <select
                  value={editUser.company_id || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, company_id: e.target.value })
                  }
                  required
                >
                  <option value="">--- Select Company ---</option>
                  {companys.map((comp) => (
                    <option key={comp.company_id} value={comp.company_id}>
                      {comp.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {editUser.role === "Sub Branch" && (
                <div className="manage-user-form-group">
                  <label>Branch :</label>
                  <select
                    value={editUser.branch_id || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, branch_id: e.target.value })
                    }
                    required
                  >
                    <option value="">--- Select Branch ---</option>
                    {branches.map((branch) => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="submit"
                className="manage-user-confirmManageUser-button"
              >
                Confirm
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUser;
