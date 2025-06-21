import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

export default function ScanPage() {
  const scannerRef = useRef(null);
  const isScanned = useRef(false);
  const [scanStatus, setScanStatus] = useState("ready"); // ready, scanning, success, error
  const [lastResult, setLastResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

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

    const successCallback = (decodedText) => {
      if (isScanned.current) return;
      isScanned.current = true;
      setScanStatus("scanning");
      setLastResult(decodedText);

      console.log("QR Code scanned:", decodedText);

      // Kirim ke backend
      fetch("http://localhost:8080/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qr: decodedText }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Scan gagal");
          return res.json();
        })
        .then((data) => {
          console.log("Scan berhasil:", data);
          setScanStatus("success");
          setTimeout(() => {
            resetScanner();
          }, 2000);
        })
        .catch((error) => {
          console.error("Gagal mengirim scan:", error);
          setScanStatus("error");
          setTimeout(() => {
            isScanned.current = false;
            setScanStatus("ready");
          }, 2000);
        });
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
          console.log("Scanner cleaned up");
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
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md mx-auto mt-8 overflow-hidden bg-white shadow-md rounded-xl">
        <div className="p-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">QR Code Scanner</h1>
          <p className="mb-6 text-gray-600">Arahkan kamera ke QR Code yang valid</p>

          {/* Scanner Area */}
          <div className="relative mb-4 overflow-hidden bg-gray-200 rounded-lg aspect-square">
            {cameraActive ? (
              <div id="qr-reader" className="w-full h-full"></div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-gray-500">Kamera nonaktif</p>
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

          {/* Controls */}
          <div className="flex flex-col gap-3">
            <button
              onClick={toggleCamera}
              className={`px-4 py-2 rounded-md font-medium ${cameraActive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              {cameraActive ? "Matikan Kamera" : "Hidupkan Kamera"}
            </button>

            <div className={`p-3 rounded-md border ${getStatusColor()}`}>
              <p className="font-medium">{getStatusMessage()}</p>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className="p-3 mt-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="mb-1 font-medium text-gray-700">Hasil Terakhir:</h3>
              <p className="text-sm text-gray-600 break-all">{lastResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
