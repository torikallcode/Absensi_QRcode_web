import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AttendanceList() {
  const [data, setData] = useState([]);
  const [kelas, setKelas] = useState("");
  const [tanggal, setTanggal] = useState("");

  const fetchData = () => {
    const query = new URLSearchParams();
    if (kelas) query.append("class", kelas);
    if (tanggal) query.append("date", tanggal);

    fetch(`http://localhost:8080/api/attendance?${query}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Gagal fetch data:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportPDF = (data) => {
    const doc = new jsPDF();

    // Format tanggal (misalnya: 25 Juni 2025)
    const formattedDate = tanggal
      ? new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      : "Semua Tanggal";

    // Judul dinamis
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
    });

    // Nama file dinamis
    const fileName = `absensi_${kelas || "semua"}_${tanggal || "semua"}.pdf`;
    doc.save(fileName);
  };


  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Daftar Absensi</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="px-2 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Kelas (contoh: 10A)"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          className="px-2 py-1 border rounded"
        />
        <button
          onClick={fetchData}
          className="px-4 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Filter
        </button>
        <button
          onClick={() => exportPDF(data)}
          className="px-4 py-1 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Export PDF
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-2 py-1 border">No</th>
            <th className="px-2 py-1 border">Nama</th>
            <th className="px-2 py-1 border">NIS</th>
            <th className="px-2 py-1 border">Kelas</th>
            <th className="px-2 py-1 border">Waktu Absensi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center text-gray-500">
                Tidak ada data absensi.
              </td>
            </tr>
          ) : (
            data.map((d, i) => (
              <tr key={d.ID}>
                <td className="px-2 py-1 text-center border">{i + 1}</td>
                <td className="px-2 py-1 border">{d.Student?.name}</td>
                <td className="px-2 py-1 border">{d.Student?.nis}</td>
                <td className="px-2 py-1 border">{d.Student?.class}</td>
                <td className="px-2 py-1 border">
                  {new Date(d.ScanTime).toLocaleString("id-ID")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
