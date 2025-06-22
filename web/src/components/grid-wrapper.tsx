import type { ReactNode } from "react";

export default function GridWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="relative w-full h-fit">
            {/* Grid Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(83,53,18,0.5) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(83,53,18,0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "12px 12px",
                }}
            />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
