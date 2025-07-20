import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md p-10 text-center">
        <h1 className="mb-4 text-6xl font-bold text-blue-600">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mb-6 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
