import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [form, setForm] = useState({ name: "", password: "" })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:8080/api/login", form)
      localStorage.setItem("user", JSON.stringify(res.data))
      navigate("/dashboard")
    } catch (err) {
      alert("Login gagal! Nama atau password salah.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white shadow-md rounded-2xl"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-600">Welcome Back</h2>

        <input
          type="text"
          placeholder="Username"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 mb-4 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-3 mb-6 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full py-3 font-semibold text-white transition duration-300 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>

        {/* <p className="mt-4 text-sm text-center text-gray-600">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Daftar sekarang
          </a>
        </p> */}
      </form>
    </div>
  )
}
