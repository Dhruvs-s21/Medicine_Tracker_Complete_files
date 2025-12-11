import { useEffect, useState } from "react";
import axios from "../utils/axios";   // ✅ use your axios instance
import { Link } from "react-router-dom";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    expiryDate: "",
    quantity: ""
  });

  // Format date → DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // Fetch medicines
  const loadMedicines = async () => {
    try {
      const res = await axios.get("/medicines/mine");  // ✅ FIXED
      setMedicines(res.data);
    } catch {
      alert("Failed to fetch medicines");
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const deleteMedicine = async (id) => {
    try {
      await axios.delete(`/medicines/delete/${id}`);  // ✅ FIXED
      loadMedicines();
    } catch {
      alert("Error deleting medicine");
    }
  };

  const startEdit = (m) => {
    setEditingId(m._id);
    setEditForm({
      name: m.name,
      expiryDate: m.expiryDate?.slice(0, 10),
      quantity: m.quantity
    });
  };

  const saveEdit = async (id) => {
    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("expiryDate", editForm.expiryDate);
      fd.append("quantity", editForm.quantity);

      await axios.put(`/medicines/update/${id}`, fd);  // ✅ FIXED

      setEditingId(null);
      loadMedicines();
    } catch {
      alert("Update failed");
    }
  };

  const cancelEdit = () => setEditingId(null);

  const makeAvailable = async (id) => {
    try {
      await axios.put(`/medicines/available/${id}`);  // ✅ FIXED
      loadMedicines();
    } catch {
      alert("Failed to change status");
    }
  };

  const markAsDonated = async (id) => {
    try {
      await axios.put(`/medicines/donated/${id}`);  // ✅ FIXED
      loadMedicines();
    } catch {
      alert("Failed to mark donated");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Medicines</h2>
        <Link
          to="/add-medicine"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md"
        >
          + Add Medicine
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Expiry</th>
              <th className="py-2 text-left w-20">Qty</th>
              <th className="py-2 text-left">Donation</th>
              <th className="py-2 text-center w-64">Actions</th>
            </tr>
          </thead>

          <tbody>
            {medicines.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No medicines added yet.
                </td>
              </tr>
            )}

            {medicines.map((m) => {
              const isExpired = new Date(m.expiryDate) <= new Date();

              return (
                <tr key={m._id} className="border-b">
                  
                  {/* EDIT MODE */}
                  {editingId === m._id ? (
                    <>
                      <td className="py-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="border px-2 py-1 rounded w-full"
                          disabled={isExpired}
                        />
                      </td>

                      <td>
                        <input
                          type="date"
                          value={editForm.expiryDate}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              expiryDate: e.target.value
                            })
                          }
                          className="border px-2 py-1 rounded"
                          disabled={isExpired}
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: e.target.value
                            })
                          }
                          className="border px-2 py-1 rounded w-16"
                          disabled={isExpired}
                        />
                      </td>

                      <td>
                        {isExpired ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
                            Expired
                          </span>
                        ) : m.status === "available" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
                            Available
                          </span>
                        ) : m.status === "private" ? (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm">
                            Not Available
                          </span>
                        ) : (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm">
                            Donated
                          </span>
                        )}
                      </td>

                      <td className="py-3">
                        {!isExpired ? (
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => saveEdit(m._id)}
                              className="text-green-600 font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-red-500 font-semibold">
                            Cannot Edit
                          </span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      {/* NORMAL MODE */}
                      <td className="py-2">{m.name}</td>
                      <td>{formatDate(m.expiryDate)}</td>
                      <td>{m.quantity}</td>

                      <td className="py-2">
                        {isExpired ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
                            Expired
                          </span>
                        ) : m.status === "available" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
                            Available
                          </span>
                        ) : m.status === "private" ? (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm">
                            Not Available
                          </span>
                        ) : (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm">
                            Donated
                          </span>
                        )}
                      </td>

                      <td className="py-2">
                        <div className="grid grid-cols-2 gap-2 w-full">
                          
                          {isExpired ? (
                            <button
                              className="border px-2 py-1 text-red-600 rounded col-span-2"
                              onClick={() => deleteMedicine(m._id)}
                            >
                              Delete
                            </button>
                          ) : (
                            <>
                              <button
                                className="border px-2 py-1 text-blue-600 rounded"
                                onClick={() => startEdit(m)}
                              >
                                Edit
                              </button>

                              <button
                                className="border px-2 py-1 text-red-600 rounded"
                                onClick={() => deleteMedicine(m._id)}
                              >
                                Delete
                              </button>

                              {m.status === "private" && (
                                <button
                                  className="border px-2 py-1 text-green-600 rounded"
                                  onClick={() => makeAvailable(m._id)}
                                >
                                  Make Available
                                </button>
                              )}

                              {m.status !== "donated" && (
                                <button
                                  className="border px-2 py-1 text-purple-600 rounded"
                                  onClick={() => markAsDonated(m._id)}
                                >
                                  Mark Donated
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
