'use client';

import { Button } from '@/components/ui/button';
import { useMagic } from '@/context/MagicContext';
import { LogOut } from 'lucide-react';
import { useCallback, useState } from 'react';
import { logout } from '@/utils/common';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/magic/ui/Spinner';

export function LogOutButton() {
	const { magic } = useMagic();
	const { setToken } = useAuth();
	const [isLoggingOut, setLoggingOut] = useState(false);

	const disconnect = useCallback(async () => {
		if (!magic) return;
		try {
			setLoggingOut(true);
			await logout(setToken, magic);
			setLoggingOut(false);
			window.location.reload(); // Refresh the page
		} catch (e) {
			console.error('Logout error:', e);
		}
	}, [magic, setToken]);
	return (
		<Button
			variant="outline"
			onClick={disconnect}
			className="p-2 text-black bg-white border border-primary/20 hover:border-primary/40"
		>
			<LogOut className="w-4 h-4 mr-2" />
			{isLoggingOut ? <Spinner /> : 'Disconnect'}
		</Button>
	);
}
