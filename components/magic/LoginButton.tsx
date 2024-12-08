'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface LoginButtonProps {
	onClick: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
	return (
		<Button
			variant="outline"
			onClick={onClick}
			className="p-1 text-primary hover:text-primary border border-primary/20 hover:border-primary/40"
		>
			<LogIn className="w-4 h-4 mr-2" />
			Login
		</Button>
	);
}
