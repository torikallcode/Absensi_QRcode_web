import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { FiMenu, FiX, FiDownload, FiCamera, FiCameraOff, FiUser, FiUsers, FiHome, FiCalendar, FiFileText } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function QrGenerator() {
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

function QrScanner() {
  const scannerRef = useRef(null);
  const isScanned = useRef(false);
  const [scanStatus, setScanStatus] = useState("ready");
  const [lastResult, setLastResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (scannerRef.current || !cameraActive) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      },
      true
    );

    scannerRef.current = scanner;

    const successCallback = async (decodedText) => {
      if (isScanned.current) return;
      isScanned.current = true;
      setScanStatus("scanning");
      setLastResult(decodedText);

      try {
        const response = await fetch("http://localhost:8080/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qr: decodedText }),
        });

        if (!response.ok) throw new Error("Scan gagal");
        
        const data = await response.json();
        setScanStatus("success");
        setScanHistory(prev => [
          {
            id: Date.now(),
            qr: decodedText,
            name: data.name || "Unknown",
            class: data.class || "Unknown",
            nis: data.nis || "N/A",
            timestamp: new Date().toLocaleString(),
            status: "success"
          },
          ...prev.slice(0, 9)
        ]);

        setTimeout(() => {
          resetScanner();
        }, 2000);
      } catch (error) {
        console.error("Gagal mengirim scan:", error);
        setScanStatus("error");
        setScanHistory(prev => [
          {
            id: Date.now(),
            qr: decodedText,
            name: "Error",
            class: "Error",
            timestamp: new Date().toLocaleString(),
            status: "error"
          },
          ...prev.slice(0, 9)
        ]);
        
        setTimeout(() => {
          isScanned.current = false;
          setScanStatus("ready");
        }, 2000);
      }
    };

    const errorCallback = (error) => {
      if (error && error !== "NotFoundException") {
        console.warn("Scan Error:", error);
      }
    };

    scanner.render(successCallback, errorCallback);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().then(() => {
          scannerRef.current = null;
        });
      }
    };
  }, [cameraActive]);

  const resetScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
        isScanned.current = false;
        setScanStatus("ready");
        setCameraActive(false);
        setTimeout(() => setCameraActive(true), 300);
      });
    }
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  const getStatusColor = () => {
    switch (scanStatus) {
      case "scanning":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "success":
        return "bg-green-100 text-green-800 border-green-300";
      case "error":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusMessage = () => {
    switch (scanStatus) {
      case "scanning":
        return "Memproses QR Code...";
      case "success":
        return "Scan berhasil!";
      case "error":
        return "Gagal memproses QR Code";
      default:
        return "Siap memindai";
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">QR Code Scanner</h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            {showHistory ? (
              <>
                <FiCamera /> Tampilkan Scanner
              </>
            ) : (
              <>
                <FiUsers /> Riwayat Scan
              </>
            )}
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">10 Scan Terakhir</h2>
          </div>
          
          {scanHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada riwayat scan
            </div>
          ) : (
            <div className="divide-y">
              {scanHistory.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${
                        item.status === "success" ? "text-green-600" : "text-red-600"
                      }`}>
                        {item.name}
                      </p>
                      <div className="flex gap-2 text-sm text-gray-500">
                        <span>{item.class}</span>
                        {item.nis && <span>| NIS: {item.nis}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{item.timestamp}</span>
                  </div>
                  <p className="p-2 mt-1 font-mono text-sm break-all bg-gray-100 rounded">
                    {item.qr}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm">
            <div className="relative overflow-hidden bg-gray-200 rounded-lg aspect-square">
              {cameraActive ? (
                <div id="qr-reader" className="w-full h-full"></div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="p-6 text-center">
                    <FiCameraOff size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">Kamera belum diaktifkan</p>
                  </div>
                </div>
              )}

              {scanStatus !== "ready" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className={`px-4 py-2 rounded-md ${getStatusColor()} font-medium`}>
                    {getStatusMessage()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={toggleCamera}
              className={`px-4 py-3 rounded-lg font-medium flex-1 flex items-center justify-center gap-2 ${
                cameraActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {cameraActive ? (
                <>
                  <FiCameraOff /> Matikan Kamera
                </>
              ) : (
                <>
                  <FiCamera /> Hidupkan Kamera
                </>
              )}
            </button>

            <div className={`p-3 rounded-lg border ${getStatusColor()} flex items-center gap-2`}>
              <div className={`w-3 h-3 rounded-full ${
                scanStatus === "scanning" ? "bg-blue-500" :
                scanStatus === "success" ? "bg-green-500" :
                scanStatus === "error" ? "bg-red-500" : "bg-gray-500"
              }`}></div>
              <p className="font-medium">{getStatusMessage()}</p>
            </div>
          </div>

          {lastResult && (
            <div className="p-4 mt-6 bg-white border rounded-lg shadow-sm">
              <h3 className="mb-2 font-medium text-gray-700">Hasil Terakhir Scan:</h3>
              <div className="p-3 border border-gray-200 rounded bg-gray-50">
                <p className="font-mono text-sm break-all">{lastResult}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AttendanceList() {
  const [data, setData] = useState([]);
  const [kelas, setKelas] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (kelas) query.append("class", kelas);
    if (tanggal) query.append("date", tanggal);

    fetch(`http://localhost:8080/api/attendance?${query}`)
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

    // Format tanggal
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
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { top: 20 },
    });

    // Nama file dinamis
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
            className={`px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 ${
              data.length === 0 
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("generator");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-30 w-64 bg-blue-800 text-white shadow-md transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <FiHome /> QR Dashboard
          </h1>
          <button 
            className="text-white md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab("generator");
              setMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              activeTab === "generator" 
                ? "bg-blue-600 shadow" 
                : "hover:bg-blue-700"
            }`}
          >
            <FiUser size={18} />
            <span>QR Generator</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("scanner");
              setMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              activeTab === "scanner" 
                ? "bg-blue-600 shadow" 
                : "hover:bg-blue-700"
            }`}
          >
            <FiCamera size={18} />
            <span>QR Scanner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("attendance");
              setMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              activeTab === "attendance" 
                ? "bg-blue-600 shadow" 
                : "hover:bg-blue-700"
            }`}
          >
            <FiFileText size={18} />
            <span>Daftar Absensi</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button 
                className="text-gray-600 md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <FiMenu size={24} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === "generator" ? "QR Generator" : 
                 activeTab === "scanner" ? "QR Scanner" : "Daftar Absensi"}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden p-2 text-gray-600 rounded-full md:block hover:bg-gray-100"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {activeTab === "generator" ? <QrGenerator /> : 
           activeTab === "scanner" ? <QrScanner /> : <AttendanceList />}
        </main>
      </div>
    </div>
  );
}