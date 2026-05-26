import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SettingsModal from "./SettingsModal";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  GiftIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: loggedIn, user, signOut } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  async function handleLogout() {
    await signOut();
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

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <>
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
            <Link to="/logbook" className={navClass("/logbook")}>
              <BookOpenIcon className="w-5 h-5 shrink-0" />
              <span className={isActive("/logbook") ? "" : "hidden sm:inline"}>
                Logbook
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
          </>
        )}
      </div>

      {loggedIn ? (
        <MenuTrigger isOpen={isMenuOpen} onOpenChange={setMenuOpen}>
          <Button className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
            <span className="hidden sm:inline">{firstName}</span>
            <ChevronDownIcon
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
            />
          </Button>
          <Popover>
            <Menu className="outline-none bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-44 text-gray-900">
              <MenuItem
                onAction={() => setSettingsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none hover:bg-gray-100 data-[focused]:bg-gray-100"
              >
                <Cog6ToothIcon className="w-4 h-4 shrink-0 text-gray-500" />
                Settings
              </MenuItem>
              <MenuItem
                onAction={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none hover:bg-gray-100 data-[focused]:bg-gray-100"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4 shrink-0 text-gray-500" />
                Logout
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
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

    <SettingsModal
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
    />
    </>
  );
}
