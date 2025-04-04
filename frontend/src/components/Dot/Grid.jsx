import React from "react";

function Placeholder({ size = 20 }) {
  const widthSpread = 20;
  const heightSpread = 10;

  return (
    <div
      style={{
        width: `${widthSpread * size + 1}px`,
        height: `${heightSpread * size + 1}px`,
      }}
      className="flex max-h-full max-w-full items-center justify-center"
    >
      <div className="rounded bg-white px-4 py-2">
        This has grid background
      </div>
    </div>
  );
}

export default function Grid({
  color = "#cacaca",
  size = 45,
  children,
  className = "",
  style = {},
}) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        ...style,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(to right, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
      className={`h-full w-full ${className}`}
    >
      {children || <Placeholder size={size} />}
    </div>
  );
}
