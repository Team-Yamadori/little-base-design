"use client";

interface BaseDiamondProps {
  bases: [boolean, boolean, boolean];
  size?: "sm" | "lg";
}

export function BaseDiamond({ bases, size = "lg" }: BaseDiamondProps) {
  const active = "#2563EB";
  const inactive = "#E5E7EB";
  const activeBorder = "#3B82F6";
  const inactiveBorder = "#D1D5DB";

  if (size === "sm") {
    return (
      <svg width="36" height="36" viewBox="0 0 36 36">
        <rect x="13" y="1" width="10" height="10" rx="1.5" transform="rotate(45, 18, 6)"
          fill={bases[1] ? active : inactive} stroke={bases[1] ? activeBorder : inactiveBorder} strokeWidth="1" />
        <rect x="-2" y="16" width="10" height="10" rx="1.5" transform="rotate(45, 3, 21)"
          fill={bases[2] ? active : inactive} stroke={bases[2] ? activeBorder : inactiveBorder} strokeWidth="1" />
        <rect x="28" y="16" width="10" height="10" rx="1.5" transform="rotate(45, 33, 21)"
          fill={bases[0] ? active : inactive} stroke={bases[0] ? activeBorder : inactiveBorder} strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points="50,90 44,86 44,82 56,82 56,86" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
      <rect x={90 - 11} y={50 - 11} width="22" height="22" rx="2.5" transform="rotate(45, 90, 50)"
        fill={bases[0] ? active : "#F3F4F6"} stroke={bases[0] ? activeBorder : inactiveBorder} strokeWidth="2"
        className="transition-all duration-300"
        style={bases[0] ? { filter: "drop-shadow(0 0 6px rgba(37,99,235,0.4))" } : {}} />
      <rect x={50 - 11} y={10 - 11} width="22" height="22" rx="2.5" transform="rotate(45, 50, 10)"
        fill={bases[1] ? active : "#F3F4F6"} stroke={bases[1] ? activeBorder : inactiveBorder} strokeWidth="2"
        className="transition-all duration-300"
        style={bases[1] ? { filter: "drop-shadow(0 0 6px rgba(37,99,235,0.4))" } : {}} />
      <rect x={10 - 11} y={50 - 11} width="22" height="22" rx="2.5" transform="rotate(45, 10, 50)"
        fill={bases[2] ? active : "#F3F4F6"} stroke={bases[2] ? activeBorder : inactiveBorder} strokeWidth="2"
        className="transition-all duration-300"
        style={bases[2] ? { filter: "drop-shadow(0 0 6px rgba(37,99,235,0.4))" } : {}} />
      {bases[0] && <circle cx="90" cy="50" r="4" fill="white" className="animate-pulse" />}
      {bases[1] && <circle cx="50" cy="10" r="4" fill="white" className="animate-pulse" />}
      {bases[2] && <circle cx="10" cy="50" r="4" fill="white" className="animate-pulse" />}
    </svg>
  );
}
