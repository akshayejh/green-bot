import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group",
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary text-primary-foreground",
          "border border-black/10 dark:border-white/10",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-3px_0_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.1)]",
          "hover:bg-primary/90 hover:translate-y-[1px] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-2px_0_0_rgba(0,0,0,0.25),0_1px_2px_0_rgba(0,0,0,0.1)]",
          "active:translate-y-[3px] active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_0px_0_0_rgba(0,0,0,0.25)]"
        ),
        destructive: cn(
          "bg-destructive text-white",
          "border border-black/10 dark:border-white/10",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-3px_0_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.1)]",
          "hover:bg-destructive/90 hover:translate-y-[1px] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-2px_0_0_rgba(0,0,0,0.25),0_1px_2px_0_rgba(0,0,0,0.1)]",
          "active:translate-y-[3px] active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_0px_0_0_rgba(0,0,0,0.25)]",
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
        ),
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-md has-[>svg]:px-3",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-5 text-base",
        icon: "size-10 rounded-md",
        "icon-sm": "size-8 rounded-sm",
        "icon-lg": "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {(variant === "default" || variant === "destructive") ? (
        <div className="relative flex flex-row items-center justify-center">
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] group-hover:transition-transform group-hover:duration-300"
            style={{ transform: 'skewX(-20deg)', width: '50%' }} />

          {/* Content with proper z-index */}
          <span className="relative z-10 flex flex-row items-center justify-center gap-2">
            {children}
          </span>
        </div>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
