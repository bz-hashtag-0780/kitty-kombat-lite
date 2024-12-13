'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/magic/ui/Spinner';
interface LoginButtonProps {
	onClick: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
	const { token } = useAuth();
	return (
		<Button
			variant="outline"
			onClick={onClick}
			className="p-1 text-black bg-white hover:text-primary border border-primary/20 hover:border-primary/40"
		>
			<LogIn className="w-4 h-4 mr-2" />
			{token.length > 0 ? <Spinner /> : 'Login'}
		</Button>
	);
}
