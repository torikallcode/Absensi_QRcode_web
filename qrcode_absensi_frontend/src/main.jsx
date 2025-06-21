import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScanPage from "./pages/ScanPage.jsx";
import QrGenerator from "./pages/QRGenerator.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/qr-generator" element={<QrGenerator />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
