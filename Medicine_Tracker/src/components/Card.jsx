export default function Card({ title, value }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h4 className="text-gray-600">{title}</h4>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
