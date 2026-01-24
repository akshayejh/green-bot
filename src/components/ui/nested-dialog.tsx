import { useEffect, useRef } from "react";
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogPanel,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LucideIcon, Info } from "lucide-react";

interface NestedDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    titleIcon?: LucideIcon;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const maxWidthClasses = {
    xs: "sm:max-w-xs",
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
};

/**
 * A dialog component optimized for stacking on top of other dialogs.
 * Uses the built-in nested dialog animations from the base Dialog component.
 * 
 * Features:
 * - Automatic scale/opacity animations when stacked
 * - Proper padding and scrollable content area
 * - Optional icon in title
 * - Optional footer for actions
 * 
 * @example
 * ```tsx
 * <NestedDialog
 *   open={helpOpen}
 *   onOpenChange={setHelpOpen}
 *   title="How to Enable Developer Mode"
 *   titleIcon={HelpCircle}
 * >
 *   <p>Step by step instructions...</p>
 * </NestedDialog>
 * ```
 */
export function NestedDialog({
    open,
    onOpenChange,
    title,
    titleIcon: TitleIcon,
    description,
    children,
    footer,
    className,
    maxWidth = "md",
}: NestedDialogProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    // Auto-focus the dialog when it opens so Escape key works immediately
    useEffect(() => {
        if (open) {
            // Small delay to ensure the dialog is rendered
            const timer = setTimeout(() => {
                popupRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Prevent escape key from propagating to parent dialogs
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            e.stopPropagation();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup
                ref={popupRef}
                className={cn(maxWidthClasses[maxWidth], className)}
                bottomStickOnMobile={false}
                onKeyDown={handleKeyDown}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {TitleIcon && <TitleIcon className="h-5 w-5 text-primary" />}
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <DialogPanel>
                    <div className="space-y-4 text-sm pt-2">
                        {children}
                    </div>
                </DialogPanel>
                {footer && (
                    <DialogFooter>
                        {footer}
                    </DialogFooter>
                )}
            </DialogPopup>
        </Dialog>
    );
}

interface NestedDialogStepProps {
    step: number;
    children: React.ReactNode;
}

/**
 * A numbered step for use inside NestedDialog content.
 */
export function NestedDialogStep({ step, children }: NestedDialogStepProps) {
    return (
        <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                {step}
            </span>
            <p>{children}</p>
        </div>
    );
}

interface NestedDialogStepsProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * A container for numbered steps with consistent styling.
 */
export function NestedDialogSteps({ children, className }: NestedDialogStepsProps) {
    return (
        <div className={cn("space-y-3 bg-muted/50 rounded-lg p-4", className)}>
            {children}
        </div>
    );
}

interface NestedDialogTipProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * A tip/hint callout for additional context.
 */
export function NestedDialogTip({ children, className }: NestedDialogTipProps) {
    return (
        <p className={cn("text-xs text-muted-foreground", className)}>
            💡 {children}
        </p>
    );
}

interface NestedDialogPreviewProps {
    children: React.ReactNode;
    label?: string;
    className?: string;
}

/**
 * A preview box showing example content (like UI mockups or code).
 */
export function NestedDialogPreview({ children, label, className }: NestedDialogPreviewProps) {
    return (
        <div className={cn("bg-background rounded-lg p-4 border text-center space-y-2", className)}>
            {label && <p className="text-xs text-muted-foreground mb-2">{label}</p>}
            {children}
        </div>
    );
}

interface NestedDialogNoteItem {
    label: string;
    path: string;
}

interface NestedDialogNoteProps {
    title?: string;
    items: NestedDialogNoteItem[];
    className?: string;
}

/**
 * An info card for showing device-specific or alternative instructions.
 */
export function NestedDialogNote({ title = "Different on your device?", items, className }: NestedDialogNoteProps) {
    return (
        <div className={cn("bg-blue-500/5 border border-blue-500/20 rounded-lg p-3", className)}>
            <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{title}</p>
                    <div className="space-y-1.5">
                        {items.map((item, index) => (
                            <div key={index} className="text-xs leading-relaxed">
                                <span className="font-medium text-foreground/90">{item.label}</span>
                                <span className="text-muted-foreground"> — </span>
                                <span className="text-muted-foreground">{item.path}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
