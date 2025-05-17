import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">
              Smart Library - API Testing Client
            </h1>
            <p className="text-sm opacity-80">
              A simple interface to test the Smart Library API
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-4">
        <div className="border-b border-indigo-500">
          <nav className="flex -mb-px">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-indigo-200 hover:text-white hover:border-indigo-300"
                }`
              }
            >
              Books
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-indigo-200 hover:text-white hover:border-indigo-300"
                }`
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/loans"
              className={({ isActive }) =>
                `mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-indigo-200 hover:text-white hover:border-indigo-300"
                }`
              }
            >
              Loans
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-indigo-200 hover:text-white hover:border-indigo-300"
                }`
              }
            >
              Stats
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
