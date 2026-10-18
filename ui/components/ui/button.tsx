import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "tw:group/button tw:inline-flex tw:min-w-0 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-control tw:border tw:border-transparent tw:bg-clip-padding tw:font-sans tw:text-button tw:font-medium tw:whitespace-nowrap tw:transition-colors tw:duration-fast tw:ease-standard tw:outline-none tw:select-none tw:focus-visible:border-ring tw:focus-visible:ring-2 tw:focus-visible:ring-ring/50 tw:active:not-aria-[haspopup]:translate-y-px tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:aria-invalid:border-destructive tw:aria-invalid:ring-2 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:border-destructive/50 tw:dark:aria-invalid:ring-destructive/40 tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0 tw:[&_svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        default: "tw:bg-primary tw:text-primary-foreground tw:hover:bg-primary/80",
        outline:
          "tw:border-border tw:bg-background tw:hover:bg-muted tw:hover:text-foreground tw:aria-expanded:bg-muted tw:aria-expanded:text-foreground tw:dark:border-input tw:dark:bg-input/30 tw:dark:hover:bg-input/50",
        secondary:
          "tw:bg-secondary tw:text-secondary-foreground tw:hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] tw:aria-expanded:bg-secondary tw:aria-expanded:text-secondary-foreground",
        ghost:
          "tw:hover:bg-muted tw:hover:text-foreground tw:aria-expanded:bg-muted tw:aria-expanded:text-foreground tw:dark:hover:bg-muted/50",
        destructive:
          "tw:bg-destructive/10 tw:text-destructive tw:hover:bg-destructive/20 tw:focus-visible:border-destructive/40 tw:focus-visible:ring-destructive/20 tw:dark:bg-destructive/20 tw:dark:hover:bg-destructive/30 tw:dark:focus-visible:ring-destructive/40",
        link: "tw:text-primary tw:underline-offset-4 tw:hover:underline",
      },
      size: {
        default:
          "tw:h-control tw:gap-2 tw:px-4 tw:has-data-[icon=inline-end]:pr-3 tw:has-data-[icon=inline-start]:pl-3",
        xs: "tw:h-control-xs tw:gap-1 tw:rounded-control-xs tw:px-2.5 tw:text-meta tw:in-data-[slot=button-group]:rounded-control-xs tw:has-data-[icon=inline-end]:pr-2 tw:has-data-[icon=inline-start]:pl-2 tw:[&_svg:not([class*=size-])]:size-3",
        sm: "tw:h-control-sm tw:gap-1.5 tw:px-3 tw:text-label tw:in-data-[slot=button-group]:rounded-control-xs tw:has-data-[icon=inline-end]:pr-2.5 tw:has-data-[icon=inline-start]:pl-2.5 tw:[&_svg:not([class*=size-])]:size-3.5",
        lg: "tw:h-control-lg tw:gap-2 tw:px-4 tw:has-data-[icon=inline-end]:pr-3 tw:has-data-[icon=inline-start]:pl-3",
        icon: "tw:size-control",
        "icon-xs":
          "tw:size-control-xs tw:rounded-control-xs tw:in-data-[slot=button-group]:rounded-control-xs tw:[&_svg:not([class*=size-])]:size-3",
        "icon-sm":
          "tw:size-control-sm tw:rounded-control-xs tw:in-data-[slot=button-group]:rounded-control-xs",
        "icon-lg": "tw:size-control-lg",
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
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
