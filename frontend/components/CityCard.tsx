"use client";

import { MapPin } from "lucide-react";
import { clsx } from "clsx";

interface CityCardProps {
  name: string;
  blurb: string;
  onSelect: (name: string) => void;
  trending?: boolean;
  className?: string;
}

export default function CityCard({ 
  name, 
  blurb, 
  onSelect, 
  trending = false,
  className 
}: CityCardProps) {
  return (
    <button 
      onClick={() => onSelect(name)} 
      className={clsx(
        "group w-full text-left rounded-xl p-4 glass border border-gray-700/50",
        "hover:glass-strong hover:border-accent-400/50 transition-all duration-300",
        "transform hover:-translate-y-1 hover:shadow-glow",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent-500/20 group-hover:bg-accent-500 text-accent-400 transition-colors duration-300">
          <MapPin size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white group-hover:text-accent-400 transition-colors duration-300 truncate">
            {name}
          </div>
          <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
            {blurb}
          </div>
        </div>
        {trending && (
          <div className="flex-shrink-0">
            <div className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded-full font-medium">
              Trending
            </div>
          </div>
        )}
      </div>
    </button>
  );
}