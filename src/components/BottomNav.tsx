import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home_app_logo' },
    { id: 'view', label: 'View', icon: 'view_in_ar' },
    { id: 'edit', label: 'Edit', icon: 'straighten' },
    { id: 'files', label: 'Files', icon: 'folder_open' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#171f33]/85 backdrop-blur-glass border-t border-[#00e5ff]/20 rounded-t-3xl shadow-2xl flex justify-around items-center h-20 pb-safe px-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-5 py-1 rounded-full ${
              isActive
                ? 'bg-[#b4e100] text-[#161e00] font-semibold shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                : 'text-[#bac9cc] hover:text-[#c3f5ff]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] font-medium mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
