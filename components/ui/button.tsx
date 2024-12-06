import * as React from 'react';

const Button = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		variant?:
			| 'default'
			| 'destructive'
			| 'outline'
			| 'secondary'
			| 'ghost'
			| 'link';
	}
>(({ className, variant = 'default', ...props }, ref) => {
	const baseStyles =
		'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
	const variantStyles = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive:
			'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline:
			'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary:
			'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline',
	};

	return (
		<button
			className={`${baseStyles} ${variantStyles[variant]} ${className}`}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button };
