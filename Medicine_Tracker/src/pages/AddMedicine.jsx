import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";   // axios instance
import toast from "react-hot-toast";

export default function AddMedicine() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    expiryDate: "",
    quantity: "",
    city: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prevent negative values
    if (form.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("expiryDate", form.expiryDate);
      fd.append("quantity", form.quantity);
      fd.append("city", form.city);

      if (image) fd.append("image", image);

      const res = await axios.post("/medicines/add", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Medicine added successfully!");
      navigate("/medicines");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Error adding medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-xl rounded-xl mt-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">Add Medicine</h2>

      <form onSubmit={handleSubmit} className="space-y-3">

        <div>
          <label className="font-medium">Name</label>
          <input
            className="border w-full px-3 py-2 rounded-md"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-medium">Expiry Date</label>
          <input
            className="border w-full px-3 py-2 rounded-md"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-medium">Quantity</label>
          <input
            className="border w-full px-3 py-2 rounded-md"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-medium">City</label>
          <input
            className="border w-full px-3 py-2 rounded-md"
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-medium">Image (optional)</label>
          <input
            className="border w-full px-3 py-2 rounded-md"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg w-full transition"
        >
          {loading ? "Adding..." : "Add Medicine"}
        </button>

      </form>
    </div>
  );
}
