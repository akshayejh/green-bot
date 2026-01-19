import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
    children?: ReactNode;
    className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
    return (
        <div className={cn("flex items-center gap-2 h-12 shrink-0 border-b px-2 bg-background", className)}>
            {children}
        </div>
    );
}

export function ToolbarLeft({ children, className }: ToolbarProps) {
    return <div className={cn("flex items-center gap-2", className)}>{children}</div>;
}

export function ToolbarRight({ children, className }: ToolbarProps) {
    return <div className={cn("flex items-center gap-2 ml-auto", className)}>{children}</div>;
}

export function ToolbarCenter({ children, className }: ToolbarProps) {
    return <div className={cn("flex items-center gap-2 flex-1 justify-center", className)}>{children}</div>;
}
