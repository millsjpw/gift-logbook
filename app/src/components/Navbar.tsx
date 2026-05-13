import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearTokens } from "../api/tokens";
import { isAuthenticated } from "../api/auth";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  GiftIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isAuthenticated();

  function handleLogout() {
    clearTokens();
    navigate("/login");
  }

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.includes(path);
  }

  function navClass(path: string) {
    return `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium ${
      isActive(path) ? "bg-blue-600 text-white" : "hover:bg-gray-700"
    }`;
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex space-x-1">
        {loggedIn && (
          <>
            <Link to="/" className={navClass("/")}>
              <Squares2X2Icon className="w-5 h-5 shrink-0" />
              <span className={isActive("/") ? "" : "hidden sm:inline"}>
                Dashboard
              </span>
            </Link>
            <Link to="/people" className={navClass("/people")}>
              <UsersIcon className="w-5 h-5 shrink-0" />
              <span className={isActive("/people") ? "" : "hidden sm:inline"}>
                My People
              </span>
            </Link>
            <Link to="/lists" className={navClass("/lists")}>
              <ClipboardDocumentListIcon className="w-5 h-5 shrink-0" />
              <span className={isActive("/lists") ? "" : "hidden sm:inline"}>
                My Lists
              </span>
            </Link>
            <Link to="/gift-exchanges" className={navClass("/gift-exchanges")}>
              <GiftIcon className="w-5 h-5 shrink-0" />
              <span
                className={
                  isActive("/gift-exchanges") ? "" : "hidden sm:inline"
                }
              >
                Exchanges
              </span>
            </Link>
            <Link to="/logbook" className={navClass("/logbook")}>
              <BookOpenIcon className="w-5 h-5 shrink-0" />
              <span className={isActive("/logbook") ? "" : "hidden sm:inline"}>
                Logbook
              </span>
            </Link>
          </>
        )}
      </div>

      {loggedIn ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5 shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      ) : (
        <Link
          to="/login"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
        >
          <ArrowRightEndOnRectangleIcon className="w-5 h-5 shrink-0" />
          <span className="hidden sm:inline">Login</span>
        </Link>
      )}
    </nav>
  );
}
