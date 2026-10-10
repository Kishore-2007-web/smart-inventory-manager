import React from 'react';
import { Home, Sparkles, ListFilter, UtensilsCrossed, Award } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, urgentCount = 0 }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: Home, badge: urgentCount > 0 ? urgentCount : null },
    { id: 'rescue', label: 'Rescue', icon: Sparkles, highlight: true },
    { id: 'inventory', label: 'Inventory', icon: ListFilter },
    { id: 'recipes', label: 'Recipes', icon: UtensilsCrossed },
    { id: 'impact', label: 'Impact', icon: Award }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-subtle-border py-2 px-3 shadow-card">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? tab.highlight
                    ? 'text-forest font-bold'
                    : 'text-forest font-bold'
                  : 'text-secondary-text hover:text-forest'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${tab.highlight && isActive ? 'text-forest' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] bg-error-red text-white font-bold leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
