import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX } from "react-icons/fi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nis: "",
    class: "",
    phone: "",
    qr_code: "" // Ini akan diisi otomatis
  });

  // Generate QR code from NIS
  useEffect(() => {
    if (formData.nis) {
      setFormData(prev => ({
        ...prev,
        qr_code: `STUDENT-${formData.nis}` // Format QR code berdasarkan NIS
      }));
    }
  }, [formData.nis]);

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/students");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = currentUser
      ? `http://localhost:8080/api/students/${currentUser.id}`
      : "http://localhost:8080/api/students";

    const method = currentUser ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Operation failed");

      fetchUsers(); // Refresh data
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      nis: user.nis,
      class: user.class,
      phone: user.phone,
      qr_code: user.qr_code // QR code akan tetap sama karena berdasarkan NIS
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      fetchUsers(); // Refresh data
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nis: "",
      class: "",
      phone: "",
      qr_code: ""
    });
    setCurrentUser(null);
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <FiPlus /> Tambah User
        </button>
      </div>

      {showForm && (
        <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit User" : "Tambah User Baru"}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">NIS</label>
              <input
                type="text"
                name="nis"
                value={formData.nis}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Kelas</label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Nomor HP</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">QR Code</label>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-mono break-all">
                  {formData.qr_code || "QR Code akan otomatis terisi setelah NIS diinput"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <FiSave /> {isEditing ? "Update" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-lg text-gray-500">Tidak ada data user</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">No</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">NIS</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Kelas</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">QR Code</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.nis}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.class}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500 whitespace-nowrap">{user.qr_code}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 rounded hover:text-blue-800 hover:bg-blue-50"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 rounded hover:text-red-800 hover:bg-red-50"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}