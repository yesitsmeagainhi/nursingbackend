import React from "react";

export type Crumb = { id: string | null; name: string };

export default function Breadcrumbs({
  trail,
  onJump,
}: {
  trail: Crumb[];
  onJump: (id: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {trail.map((c, i) => (
        <React.Fragment key={c.id ?? "root"}>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => onJump(c.id)}
          >
            {c.name}
          </button>
          {i < trail.length - 1 && <span className="opacity-50">/</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
