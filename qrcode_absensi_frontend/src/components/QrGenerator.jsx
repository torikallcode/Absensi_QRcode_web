import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { FiDownload, FiX } from "react-icons/fi";

export default function QrGenerator() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:8080/api/students");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const downloadQRCode = (id, name) => {
    const qrElement = document.getElementById(`qr-${id}`);
    if (!qrElement) return;

    toPng(qrElement)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `qr-${name}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("QR Download error:", error);
      });
  };

  const downloadAllQRCodes = async () => {
    for (const student of filteredStudents) {
      if (student.qr_code) {
        await new Promise(resolve => {
          setTimeout(() => {
            downloadQRCode(student.id, student.name);
            resolve();
          }, 300);
        });
      }
    }
  };

  const classes = [...new Set(students.map(student => student.class))];
  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedClass === "all" || student.class === selectedClass)
    );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">QR Code Siswa</h1>
        
        <div className="flex flex-col w-full gap-3 sm:flex-row md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari siswa..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          
          <select
            className="px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          
          {filteredStudents.length > 0 && (
            <button
              onClick={downloadAllQRCodes}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FiDownload /> Download Semua
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-lg text-gray-500">Tidak ada siswa yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.class}</p>
                </div>
                <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
                  {student.id}
                </span>
              </div>

              {student.qr_code ? (
                <div className="flex flex-col items-center mt-4">
                  <div
                    id={`qr-${student.id}`}
                    className="inline-block p-2 bg-white border rounded"
                  >
                    <QRCode value={student.qr_code} size={128} />
                  </div>
                  <button
                    onClick={() => downloadQRCode(student.id, student.name)}
                    className="flex items-center gap-1 px-3 py-1 mt-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <FiDownload size={14} /> Download
                  </button>
                </div>
              ) : (
                <div className="p-3 mt-4 text-center text-red-500 rounded-lg bg-red-50">
                  QR Code tidak tersedia
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}