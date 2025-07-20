import { useEffect, useState } from "react";
import { FiMenu, FiX, FiHome, FiUser, FiCamera, FiFileText } from "react-icons/fi";
import AttendanceList from "../components/AttendanceList";
import QrGenerator from "../components/QrGenerator";
import QrScanner from "../components/QrScanner";
import { FiUsers as FiUserManagement } from "react-icons/fi";
import UserManagement from "../components/UserManagement";

export default function DashboardPage() {
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
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`fixed md:relative z-30 w-64 bg-blue-800 text-white shadow-md transform transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
              setActiveTab("scanner");
              setMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "scanner"
              ? "bg-blue-600 shadow"
              : "hover:bg-blue-700"
              }`}
          >
            <FiCamera size={18} />
            <span>QR Scanner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("generator");
              setMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "generator"
              ? "bg-blue-600 shadow"
              : "hover:bg-blue-700"
              }`}
          >
            <FiUser size={18} />
            <span>QR Generator</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("attendance");
              setMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "attendance"
              ? "bg-blue-600 shadow"
              : "hover:bg-blue-700"
              }`}
          >
            <FiFileText size={18} />
            <span>Daftar Absensi</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              setMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "users"
              ? "bg-blue-600 shadow"
              : "hover:bg-blue-700"
              }`}
          >
            <FiUserManagement size={18} />
            <span>Manajemen User</span>
          </button>
        </nav>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
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

        <main className="flex-1 overflow-auto bg-gray-50">
          {activeTab === "scanner" ? <QrScanner /> :
            activeTab === "generator" ? <QrGenerator /> :
              activeTab === "attendance" ? <AttendanceList /> :
                <UserManagement />}
        </main>
      </div>
    </div>
  );
}