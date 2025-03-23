import React, { useState } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUser.css";

const AddUserForm = ({ isOpen, toggleForm, addUser }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    firstName: "",
    surname: "",
    address: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) {
      alert("Please select a role before adding.");
      return;
    }

    const newUser = {
      id: Date.now().toString(), // ใช้ timestamp เป็น id
      username: formData.username,
      email: formData.email,
      name: `${formData.firstName} ${formData.surname}`,
      role: formData.role,
    };

    addUser(newUser); // ส่งข้อมูลไปยัง ManageUser
    setFormData({
      username: "",
      password: "",
      email: "",
      phone: "",
      firstName: "",
      surname: "",
      address: "",
      role: "",
    });
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
              <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="manage-user-form-group">
              <label>Password :</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="manage-user-form-group">
              <label>Email :</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="manage-user-form-group">
              <label>Phone :</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="manage-user-form-group">
              <label>First name :</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="manage-user-form-group">
              <label>Surname :</label>
              <input type="text" name="surname" value={formData.surname} onChange={handleChange} />
            </div>
            <div className="manage-user-form-group">
              <label>Address :</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="manage-user-form-group">
              <label>Role :</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">--- Select ---</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Main Branch">Main Branch</option>
                <option value="Sub Branch">Sub Branch</option>
              </select>
            </div>
            <button type="submit" className="manage-user-confirmAddUser-button">Confirm</button>
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
  const [userList, setUserList] = useState([
    {
      id: "00001",
      username: "ArayaKos",
      email: "ary@gmail.com",
      name: "Araya Kositkrai",
      role: "Super Admin",
    },
    {
      id: "00002",
      username: "JohnDoe",
      email: "john@gmail.com",
      name: "John Doe",
      role: "Admin",
    },
    {
      id: "00003",
      username: "JaneS",
      email: "jane@gmail.com",
      name: "Jane Smith",
      role: "User",
    },
    {
      id: "00004",
      username: "Alice",
      email: "alice@gmail.com",
      name: "Alice Wonderland",
      role: "Main Branch",
    },
    {
      id: "00005",
      username: "Bob",
      email: "bob@gmail.com",
      name: "Bob Builder",
      role: "Sub Branch",
    },
    {
      id: "00006",
      username: "Charlie",
      email: "charlie@gmail.com",
      name: "Charlie Chaplin",
      role: "User",
    },
    {
      id: "00007",
      username: "David",
      email: "david@gmail.com",
      name: "David Beckham",
      role: "Admin",
    },
    {
      id: "00008",
      username: "Emily",
      email: "emily@gmail.com",
      name: "Emily Blunt",
      role: "Super Admin",
    },
    // เพิ่มข้อมูลผู้ใช้เพิ่มเติมที่นี่
  ]);

    // ฟังก์ชันเพิ่ม User ใหม่
    const addUser = (newUser) => {
      // หา ID สูงสุดจาก userList และเพิ่ม 1
      const maxId = userList.length > 0 ? Math.max(...userList.map(user => parseInt(user.id))) : 0;
      newUser.id = (maxId + 1).toString().padStart(5, '0'); // ให้ ID เป็นตัวเลข 5 หลัก เช่น "00006"
    
      setUserList([...userList, newUser]);
    };
    

  const usersPerPage = 5;

  const filteredUsers = userList.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleEdit = (user) => {
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      firstName: user.name.split(" ")[0] || "",
      surname: user.name.split(" ")[1] || "",
      address: user.address || "",
      role: user.role,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editUser.role) {
      alert("Please select a role before saving.");
      return;
    }

    setUserList((prevUsers) =>
      prevUsers.map((user) =>
        user.id === editUser.id ? { ...user, ...editUser } : user
      )
    );

    setEditUser(null); // ปิดฟอร์มแก้ไข
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      const updatedUserList = userList.filter((user) => user.id !== id);
      setUserList(updatedUserList);
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
    <div className="manage-user-container" style={{
      height: "100vh",
      overflowY: "auto",
    }}>
      <AddUserForm isOpen={isOpen} toggleForm={() => setIsOpen(!isOpen)} addUser={addUser} />

      <div className="manage-user-header">
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>Manage User</span>
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
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
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
                <label>Phone :</label>
                <input
                  type="text"
                  value={editUser.phone}
                  onChange={(e) =>
                    setEditUser({ ...editUser, phone: e.target.value })
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
                <label>Address :</label>
                <input
                  type="text"
                  value={editUser.address}
                  onChange={(e) =>
                    setEditUser({ ...editUser, address: e.target.value })
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
              <button type="submit" className="manage-user-confirmManageUser-button">
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
