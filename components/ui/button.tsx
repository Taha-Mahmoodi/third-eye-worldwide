import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Variant set:
 *
 * The first six (`default`, `destructive`, `outline`, `secondary`,
 * `ghost`, `link`) are stock shadcn — kept so generic shadcn examples
 * still drop in cleanly.
 *
 * The last four (`brand`, `accent`, `pillSecondary`, `pillGhost`)
 * are the project's pill style — they reproduce the legacy
 * `.btn-primary`, `.btn-accent`, `.btn-secondary`, `.btn-ghost`
 * appearance using design-token utilities, so callers can move from
 * className-based buttons to <Button variant="..."> without a visual
 * diff. Pair them with `size="pill"`.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        outline: 'border border-input bg-background hover:bg-secondary hover:text-secondary-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
        ghost: 'hover:bg-secondary hover:text-secondary-foreground',
        link: 'text-primary underline-offset-4 hover:underline',

        // Brand pill — solid blue, white text. Matches .btn-primary.
        brand:
          'bg-primary text-white border-0 hover:bg-[var(--brand-hover)] hover:text-white',
        // Accent pill — solid orange, white text. Matches .btn-accent.
        accent:
          'bg-accent text-white border-0 hover:bg-[var(--accent-hover)] hover:text-white',
        // Outlined pill, foreground text. Matches .btn-secondary.
        // `border-solid` is needed because Tailwind's preflight is disabled
        // in this project, so borders default to `style: none`.
        pillSecondary:
          'bg-transparent text-foreground border-solid border-2 border-[var(--border-strong)] hover:border-primary hover:text-primary',
        // Soft elevated pill. Matches .btn-ghost.
        pillGhost:
          'bg-[var(--bg-elevated)] text-foreground border-solid border-[1.5px] border-border hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] hover:text-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        // Pill size — matches the legacy .btn-* padding/typography.
        pill: 'rounded-full px-7 py-[14px] text-base font-semibold font-display',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
