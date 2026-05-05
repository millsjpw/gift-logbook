import { Link, useNavigate } from "react-router-dom";
import { clearTokens } from "../api/tokens";
import { isAuthenticated } from "../api/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  function handleLogout() {
    clearTokens();
    navigate("/login");
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex space-x-4">
        {loggedIn && (
          <>
            <Link
              to="/"
              className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/people"
              className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              My People
            </Link>
            <Link
              to="/lists"
              className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              My Lists
            </Link>
            <Link
              to="/gift-exchanges"
              className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Gift Exchanges
            </Link>
          </>
        )}
      </div>

      {loggedIn ? (
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
        >
          Logout
        </button>
      ) : (
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
