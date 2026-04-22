import { NavLink } from "react-router-dom";
import { Menu, X, Leaf, Moon, Sun } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import { useAppStore } from "../../store/useAppStore";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Treatments", href: "/treatments" },
  { name: "History", href: "/history" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex shrink-0 items-center">
                  <Leaf className="h-8 w-8 text-agri-primary" />
                  <span className="ml-2 text-xl font-bold text-slate-900">
                    AgriVision
                  </span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                          isActive
                            ? "border-agri-primary text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button
                  onClick={toggleTheme}
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-agri-primary focus:ring-offset-2"
                >
                  <span className="sr-only">Toggle theme</span>
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-agri-primary">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={NavLink}
                  to={item.href}
                  className={({ isActive }) =>
                    `block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                      isActive
                        ? "border-agri-primary bg-agri-primary/10 text-agri-primary"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    }`
                  }
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
