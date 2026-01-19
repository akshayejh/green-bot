import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
    delay?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(({ className, delay, style, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            // To tweak animation:
            // 1. Change duration-1000 to your preferred time 
            // 2. Change ease-[...] to your preferred curve
            // We use zoom-in-100 to force the start scale to 1 (preventing any default scaling artifacts)
            "animate-in fade-in zoom-in-100 duration-1000 ease-[cubic-bezier(0.25,0.4,0.25,1)]",
            className
        )}
        style={{
            animationDelay: delay ? `${delay}ms` : undefined,
            animationFillMode: 'both', // Ensures the element is hidden (opacity 0) during the delay
            ...style
        }}
        {...props}
    />
));
FadeIn.displayName = "FadeIn";
