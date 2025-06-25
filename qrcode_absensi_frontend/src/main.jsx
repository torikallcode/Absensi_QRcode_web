import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScanPage from "./pages/ScanPage.jsx";
import QrGenerator from "./pages/QRGenerator.jsx";
import "./index.css";
import Dashboard from "./pages/Dashboard.jsx";
import AttendanceList from "./pages/AttendanceList.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/qr-generator" element={<QrGenerator />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/att" element={<AttendanceList />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
