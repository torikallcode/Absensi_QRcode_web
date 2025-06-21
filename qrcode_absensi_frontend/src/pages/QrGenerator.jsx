import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

export default function QrGenerator() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  console.log(students)

  // Fungsi untuk download QR
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">QR Code Siswa</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.id} className="p-4 border rounded shadow">
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-gray-500">{student.class}</p>

            {student.qr_code ? (
              <div className="mt-2">
                <div
                  id={`qr-${student.id}`}
                  className="bg-white p-2 inline-block"
                >
                  <QRCode value={student.qr_code} size={128} />
                </div>
                <button
                  onClick={() => downloadQRCode(student.id, student.name)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Download QR
                </button>
              </div>
            ) : (
              <p className="text-red-500">QR kosong</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
