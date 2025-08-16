"use client";

import { MapPin } from "lucide-react";

export default function CityCard({ name, blurb, onSelect }: { name: string; blurb: string; onSelect: (n: string) => void }) {
	return (
		<button onClick={() => onSelect(name)} className="group w-full text-left rounded-xl p-4 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:from-brand/20 hover:border-brand transition">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-white/10 group-hover:bg-brand text-white">
					<MapPin size={18} />
				</div>
				<div>
					<div className="font-medium">{name}</div>
					<div className="text-xs text-white/70">{blurb}</div>
				</div>
			</div>
		</button>
	);
}