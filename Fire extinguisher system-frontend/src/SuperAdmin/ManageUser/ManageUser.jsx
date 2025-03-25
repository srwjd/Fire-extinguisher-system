import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUser.css";

// const AddUserForm = ({ isOpen, toggleForm, addUser, setUserList }) => {
//     const [formData, setFormData] = useState({
//       username: "",
//       password: "",
//       email: "",
//       firstName: "",
//       surname: "",
//       role: "",
//     });

//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       if (!formData.role) {
//           alert("Please select a role before adding.");
//           return;
//       }

//       try {
//           const response = await axios.post("http://localhost:3000/fire/addUser", formData);
//           alert("User added successfully!");
//           setUserList(prevUsers => [...prevUsers, formData]); // อัปเดตรายชื่อ user ใน frontend
//           setFormData({
//               username: "",
//               password: "",
//               email: "",
//               firstName: "",
//               surname: "",
//               role: "",
//           });
//       } catch (error) {
//           console.error("Error adding user:", error);
//           alert("Failed to add user.");
//       }

//   const newUser = {
//       id: Date.now().toString(),
//       username: formData.username,
//       email: formData.email,
//       name: `${formData.firstName} ${formData.surname}`,
//       role: formData.role,
//     };

//   addUser(newUser); // ส่งข้อมูลไปยัง ManageUser
//   setFormData({
//     username: "",
//     password: "",
//     email: "",
//     firstName: "",
//     surname: "",
//     role: "",
//   });
// };

const AddUserForm = ({ isOpen, toggleForm, addUser, setUserList }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    surname: "",
    role: "",
  });

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

      // Add the new user to the list immediately
      setUserList((prevUsers) => [
        ...prevUsers,
        { ...formData, id: Date.now().toString() }, // Adding the new user to the list
      ]);

      // Reset the form fields
      setFormData({
        username: "",
        password: "",
        email: "",
        firstName: "",
        surname: "",
        role: "",
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
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Main Branch">Main Branch</option>
                <option value="Sub Branch">Sub Branch</option>
              </select>
            </div>
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

  // ดูรายชื่อ User
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/fire/showAllUser"
        );
        setUserList(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
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

  // const handleEdit = (user) => {
  //   setEditUser({
  //     id: user.id,
  //     username: user.username,
  //     email: user.email,
  //     firstName: user.name.split(" ")[0] || "",
  //     surname: user.name.split(" ")[1] || "",
  //     role: user.role,
  //   });
  // };

  // const handleSave = (e) => {
  //   e.preventDefault();
  //   if (!editUser.role) {
  //     alert("Please select a role before saving.");
  //     return;
  //   }

  //   setUserList((prevUsers) =>
  //     prevUsers.map((user) =>
  //       user.id === editUser.id ? { ...user, ...editUser } : user
  //     )
  //   );

  //   setEditUser(null); // ปิดฟอร์มแก้ไข
  // };

  // const handleDelete = (id) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete?");
  //   if (confirmDelete) {
  //     const updatedUserList = userList.filter((user) => user.id !== id);
  //     setUserList(updatedUserList);
  //   }
  // };

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
          {/* <FaSearch className="manage-user-search-icon" /> */}
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
