"use client";

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavProps) {
  const tabs = ["Task Manager", "Appointment Manager", "Generate Schedule", "Settings"];

  return (
    <nav className="flex justify-center border-b border-gray-800 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-6 py-4 font-medium text-sm transition-colors relative ${
            activeTab === tab
              ? "text-green-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-t-full" />
          )}
        </button>
      ))}
    </nav>
  );
}