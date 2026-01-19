import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FooterProps {
    children?: ReactNode;
    className?: string;
}

export function Footer({ children, className }: FooterProps) {
    return (
        <div className={cn("flex items-center h-8 px-2 border-t bg-muted/40 text-xs text-muted-foreground", className)}>
            {children}
        </div>
    );
}

export function FooterLeft({ children, className }: FooterProps) {
    return (
        <div className={cn("flex items-center gap-4 flex-1", className)}>
            {children}
        </div>
    );
}

export function FooterRight({ children, className }: FooterProps) {
    return (
        <div className={cn("flex items-center gap-4 ml-auto", className)}>
            {children}
        </div>
    );
}
