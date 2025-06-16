// src/components/Layout/Sidebar.jsx
import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Sidebar = ({ menuItems, currentPath, isOpen, onClose, onNavigate }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (key) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigate = (path) => {
    onNavigate(path);
    onClose();
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.key);
    const isActive = item.path === currentPath;

    if (hasChildren) {
      return (
        <div key={item.key} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.key)}
            className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-6 space-y-1">
              {item.children.map((child) => renderMenuItem(child))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => handleNavigate(item.path)}
        className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <span className="mr-3 text-lg">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      <div className="fixed inset-0 w-1/6">
        <div className="flex flex-col h-full">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  EquipCare
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
              {menuItems.map((item) => renderMenuItem(item))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-5 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                EquipCare
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
