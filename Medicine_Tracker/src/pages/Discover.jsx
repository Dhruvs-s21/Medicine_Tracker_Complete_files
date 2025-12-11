import { useEffect, useState } from "react";
import axios from "../utils/axios";   // ✅ use axios instance

export default function Discover() {
  const [donations, setDonations] = useState([]);
  const [enlargeImage, setEnlargeImage] = useState(null);

  // Format date → DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const loadMedicines = async () => {
    try {
      const res = await axios.get("/medicines/discover");  // ✅ FIXED
      setDonations(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load available medicines");
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Available for Donation</h2>

      {/* IMAGE POPUP */}
      {enlargeImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setEnlargeImage(null)}
        >
          <img
            src={enlargeImage}
            alt="Medicine"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {donations.length === 0 && (
          <p className="text-gray-500">No medicines available for donation.</p>
        )}

        {donations.map((m) => (
          <div
            key={m._id}
            className="p-5 bg-white shadow-md rounded-xl border border-gray-200 flex gap-6"
          >
            {/* IMAGE */}
            <div
              className="w-48 h-48 border rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden cursor-pointer"
              onClick={() => m.image && setEnlargeImage(m.image)}
            >
              {m.image ? (
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">No Image Attached</span>
              )}
            </div>

            {/* DETAILS */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-xl">{m.name}</h3>

                <p>
                  <strong>Expiry:</strong>{" "}
                  {formatDate(m.expiryDate || m.expiry)}
                </p>

                <p><strong>Quantity:</strong> {m.quantity}</p>
                <p><strong>City:</strong> {m.city}</p>

                <p><strong>Donor:</strong> {m.donor?.name}</p>
                <p><strong>Phone:</strong> {m.donor?.phone}</p>
              </div>

              {/* BUTTONS */}
              <div className="mt-3 flex gap-3">
                <a
                  href={`tel:${m.donor?.phone}`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Call Donor
                </a>

                <a
                  href={`https://wa.me/${m.donor?.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
