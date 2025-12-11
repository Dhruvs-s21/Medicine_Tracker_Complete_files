import { useEffect, useState } from "react";
import axios from "../utils/axios";   // ✅ use your axios instance (auto baseURL + token)

export default function Dashboard() {
  const [medicines, setMedicines] = useState([]);

  const loadMedicines = async () => {
    try {
      const res = await axios.get("/medicines/mine");   // ✅ NO localhost
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  // Count statistics
  const total = medicines.length;
  const available = medicines.filter((m) => m.status === "available").length;
  const donated = medicines.filter((m) => m.status === "donated").length;
  const privateMeds = medicines.filter((m) => m.status === "private").length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white p-6 shadow rounded border border-gray-200">
          <h3 className="text-lg font-semibold">Total Medicines</h3>
          <p className="text-3xl mt-2">{total}</p>
        </div>

        <div className="bg-blue-100 p-6 shadow rounded border border-blue-200">
          <h3 className="text-lg font-semibold">Available</h3>
          <p className="text-3xl mt-2">{available}</p>
        </div>

        <div className="bg-purple-100 p-6 shadow rounded border border-purple-200">
          <h3 className="text-lg font-semibold">Donated</h3>
          <p className="text-3xl mt-2">{donated}</p>
        </div>

        <div className="bg-gray-100 p-6 shadow rounded border border-gray-200">
          <h3 className="text-lg font-semibold">Private</h3>
          <p className="text-3xl mt-2">{privateMeds}</p>
        </div>

      </div>
    </div>
  );
}
