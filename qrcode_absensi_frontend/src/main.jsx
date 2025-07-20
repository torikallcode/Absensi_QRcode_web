import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import ScanPage from "./pages/ScanPage_.jsx";
// import QrGenerator from "./pages/QRGenerator.jsx";
import "./index.css";
import DashboardPage from "./pages/DashboardPage";
// import LoginPage from "./pages/LoginPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./components/NotFound";
// import Dashboard from "./pages/Dashboard_.jsx";
// import AttendanceList from "./pages/AttendanceList_.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registeradmin" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFound />} />
        {/* <Route path="/" element={<LoginPage />} /> */}
        {/* <Route path="/scan" element={<ScanPage />} />
        <Route path="/qr-generator" element={<QrGenerator />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/att" element={<AttendanceList />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
