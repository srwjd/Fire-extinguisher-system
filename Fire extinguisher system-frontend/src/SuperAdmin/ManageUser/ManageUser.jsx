/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"
import axios from "axios";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUser.css";
import './Modal.css';
import Swal from "sweetalert2";

const AddUserForm = ({
  isOpen,
  toggleForm,
  addUser,
  setUserList,
  fetchUsers,
}) => {
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
      toast.warning("Please select a role before adding.", { autoClose: 3000, className: "custom-toast-super", position: "top-center" });
      return;
    }

    if (!formData.firstName.trim() || !formData.surname.trim()) {
      toast.warning("Please enter your full name.", { autoClose: 3000, className: "custom-toast-super", position: "top-center" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/fire/addUser",
        formData
      );
      toast.success("User successfully added.", { className: "custom-toast-super", position: "top-center" });

      // fetch users ใหม่
      fetchUsers();

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
      toast.error("User addition failed.", { position: "top-center" });
    }
  };

  return (
    <div className="manage-user-addUser-allpage-container">
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
                    <option
                      key={companys.company_id}
                      value={companys.company_id}
                    >
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
        const response = await axios.get("http://localhost:3000/fire/companys");
        setCompanys(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await axios.get("http://localhost:3000/fire/branches");
        setBranches(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchCompanys();
    fetchBranches();
  }, []);

  // ดูรายชื่อ User
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

  useEffect(() => {
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
      id: user.user_id,
      username: user.username,
      email: user.email,
      firstName: user.firstname || "",
      surname: user.surname || "",
      role: user.role_name,
      company_id: user.company_id || "",
      branch_id: user.branch_id || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser.role) {
      toast.warning("Please select a role.", { autoClose: 3000, className: "custom-toast-super", position: "top-center" });
      return;
    }

    console.log(editUser); // ตรวจสอบค่าของ editUser ก่อนส่ง

    try {
      await axios.put(
        `http://localhost:3000/fire/updateUser/${editUser.id}`,
        editUser
      );
      fetchUsers();
      toast.success("User updated successfully.", { className: "custom-toast-super", position: "top-center" });

      setUserList((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editUser.id ? { ...user, ...editUser } : user
        )
      );
      setEditUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("User update failed.", { position: "top-center" });
    }
  };



  const confirmDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FD6E2B",
      cancelButtonColor: "#FD6E2B",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      width: "350px",
      height: "300px",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/fire/deleteUser/${id}`);
        toast.success("User deleted successfully.", { className: "custom-toast-super", position: "top-center" });
        fetchUsers(); // <-- เรียกใหม่
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("User deletion failed.");
      }
    };
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
    <div style={{ height: "90vh" }}>
      <div
        className="manage-user-container"
        style={{
          height: "100%",
          overflowY: "auto",
          paddingRight: "20px",
        }}
      >
        <AddUserForm
          isOpen={isOpen}
          toggleForm={() => setIsOpen(!isOpen)}
          addUser={addUser}
          setUserList={setUserList}
          fetchUsers={fetchUsers}
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
            <table style={{ borderColor: "#FD6E2B" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>ID</th>
                  <th style={{ textAlign: "center" }}>Username</th>
                  <th style={{ textAlign: "center" }}>Email</th>
                  <th style={{ textAlign: "center" }}>Name</th>
                  <th style={{ textAlign: "center" }}>Role</th>
                  <th style={{ textAlign: "center" }}>Edit</th>
                  <th style={{ textAlign: "center" }}>Delete</th>
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
                      <td>
                        {(() => {
                          if (user.role_name === "SuperAdmin") {
                            return "Super Admin";
                          } else if (user.role_name === "Admin") {
                            return "Admin";
                          } else if (user.role_name === "MainBranch") {
                            return "Main Branch";
                          } else if (user.role_name === "SubBranch") {
                            return "Sub Branch";
                          } else if (user.role_name === "User") {
                            return "User";
                          } else {
                            return "Unknown";
                          }
                        })()}
                      </td>
                      <td>
                        <FaEdit
                          className="manage-user-edit-icon"
                          onClick={() => handleEdit(user)}
                        />
                      </td>
                      <td>
                        <FaTrash
                          className="manage-user-delete-icon"
                          onClick={() => confirmDelete(user.user_id)}
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
                    <option value="SuperAdmin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="MainBranch">Main Branch</option>
                    <option value="SubBranch">Sub Branch</option>
                  </select>
                </div>

                {editUser.role === "MainBranch" && (
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
                      {companys.map((company) => (
                        <option
                          key={company.company_id}
                          value={company.company_id}
                        >
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editUser.role === "SubBranch" && (
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
    </div>
  );
};

export default ManageUser;
