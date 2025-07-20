import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiCalendar, FiFileText } from "react-icons/fi";

export default function AttendanceList() {
  const [data, setData] = useState([]);
  const [kelas, setKelas] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (kelas) query.append("class", kelas);
    if (tanggal) query.append("date", tanggal);

    fetch(`http://localhost:8080/api/attendances?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Gagal fetch data:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();

    const formattedDate = tanggal
      ? new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      : "Semua Tanggal";

    const title = `Daftar Absensi Kelas ${kelas || "Semua Kelas"} - ${formattedDate}`;
    doc.text(title, 14, 10);

    autoTable(doc, {
      head: [["No", "Nama", "NIS", "Kelas", "Waktu Absensi"]],
      body: data.map((item, index) => [
        index + 1,
        item.Student?.name || "-",
        item.Student?.nis || "-",
        item.Student?.class || "-",
        new Date(item.ScanTime).toLocaleString("id-ID"),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { top: 20 },
    });

    const fileName = `absensi_${kelas || "semua"}_${tanggal || "semua"}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Absensi</h1>

        <div className="flex flex-col w-full gap-3 sm:flex-row md:w-auto">
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Filter Kelas (contoh: 10A)"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FiCalendar /> Filter
          </button>
          <button
            onClick={exportPDF}
            disabled={data.length === 0}
            className={`px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 ${data.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              }`}
          >
            <FiFileText /> Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                No
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Nama
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                NIS
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Kelas
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Waktu Absensi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data absensi.
                </td>
              </tr>
            ) : (
              data.map((d, i) => (
                <tr key={d.ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {d.Student?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {d.Student?.nis || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {d.Student?.class || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(d.ScanTime).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}