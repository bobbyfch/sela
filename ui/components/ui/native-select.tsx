import * as React from "react"
import { cn } from "cn"

function NativeSelect({ className, style, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "tw:box-border tw:min-h-control-touch tw:min-w-0 tw:max-w-full tw:appearance-none tw:rounded-control tw:border tw:border-sela-line tw:bg-sela-surface tw:px-3 tw:pr-10 tw:font-sans tw:text-label tw:text-sela-ink tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-sela-accent/50 tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
        className,
      )}
      style={{
        backgroundImage: "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
        backgroundPosition: "calc(100% - 13px) 50%, calc(100% - 9px) 50%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "4px 4px",
        ...style,
      }}
      {...props}
    />
  )
}

export { NativeSelect }
