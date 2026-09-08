import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SettingsModal from "./SettingsModal";
import LogbookManagerModal from "./LogbookManagerModal";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Select,
  SelectValue,
  ListBox,
  ListBoxItem,
} from "react-aria-components";
import { useAuth } from "../context/AuthContext";
import { useLogbook } from "../context/LogbookContext";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  FolderIcon,
  GiftIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: loggedIn, user, signOut } = useAuth();
  const { logbooks, activeLogbookId, setActiveLogbookId } = useLogbook();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLogbooksOpen, setLogbooksOpen] = useState(false);

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
                <span
                  className={isActive("/logbook") ? "" : "hidden sm:inline"}
                >
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
              <Link
                to="/gift-exchanges"
                className={navClass("/gift-exchanges")}
              >
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
          <div className="flex items-center gap-2">
            {logbooks.length > 1 && (
              <Select
                selectedKey={activeLogbookId}
                onSelectionChange={(key) =>
                  key && setActiveLogbookId(key as string)
                }
                aria-label="Active logbook"
              >
                <Button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-white cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  <RectangleStackIcon className="w-4 h-4 shrink-0" />
                  <SelectValue className="hidden sm:inline max-w-32 truncate" />
                  <ChevronDownIcon className="w-3.5 h-3.5 shrink-0" />
                </Button>
                <Popover className="min-w-44">
                  <ListBox className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 outline-none">
                    {logbooks.map((lb) => (
                      <ListBoxItem
                        key={lb.id}
                        id={lb.id}
                        textValue={lb.name}
                        className="px-3 py-2 text-sm cursor-pointer outline-none text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 selected:bg-blue-50 dark:selected:bg-blue-900"
                      >
                        {lb.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
            )}

            <MenuTrigger isOpen={isMenuOpen} onOpenChange={setMenuOpen}>
              <Button className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
                <span className="hidden sm:inline">{firstName}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                />
              </Button>
              <Popover>
                <Menu className="outline-none bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-44 text-gray-900 dark:text-gray-100">
                  <MenuItem
                    onAction={() => setLogbooksOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-700 data-[focused]:bg-gray-100 dark:data-[focused]:bg-gray-700"
                  >
                    <FolderIcon className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                    Logbooks
                  </MenuItem>
                  <MenuItem
                    onAction={() => setSettingsOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-700 data-[focused]:bg-gray-100 dark:data-[focused]:bg-gray-700"
                  >
                    <Cog6ToothIcon className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                    Settings
                  </MenuItem>
                  <MenuItem
                    onAction={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-700 data-[focused]:bg-gray-100 dark:data-[focused]:bg-gray-700"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                    Logout
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
          </div>
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
      <LogbookManagerModal
        isOpen={isLogbooksOpen}
        onClose={() => setLogbooksOpen(false)}
      />
    </>
  );
}
