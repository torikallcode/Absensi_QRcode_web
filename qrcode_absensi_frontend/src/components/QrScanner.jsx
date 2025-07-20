import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { FiCamera, FiCameraOff, FiUsers, FiX } from "react-icons/fi";

export default function QrScanner() {
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

        {/* <div className="flex gap-3">
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
        </div> */}
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
                      <p className={`font-medium ${item.status === "success" ? "text-green-600" : "text-red-600"
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
              className={`px-4 py-3 rounded-lg font-medium flex-1 flex items-center justify-center gap-2 ${cameraActive
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
              <div className={`w-3 h-3 rounded-full ${scanStatus === "scanning" ? "bg-blue-500" :
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