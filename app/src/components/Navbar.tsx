import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearTokens } from "../api/tokens";
import { isAuthenticated } from "../api/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isAuthenticated();

  function handleLogout() {
    clearTokens();
    navigate("/login");
  }

  function navClass(path: string) {
    if (path === "/") {
      // Special case for root path - only active if we're exactly on it
      return location.pathname === "/"
        ? "bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
        : "hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium";
    }
    const active = location.pathname.includes(path);
    return `px-3 py-2 rounded-md text-sm font-medium ${
      active ? "bg-blue-600 text-white" : "hover:bg-gray-700"
    }`;
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex space-x-4">
        {loggedIn && (
          <>
            <Link to="/" className={navClass("/")}>
              Dashboard
            </Link>
            <Link to="/people" className={navClass("/people")}>
              My People
            </Link>
            <Link to="/lists" className={navClass("/lists")}>
              My Lists
            </Link>
            <Link to="/gift-exchanges" className={navClass("/gift-exchanges")}>
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
