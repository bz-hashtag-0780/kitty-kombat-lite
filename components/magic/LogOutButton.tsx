'use client';

import { Button } from '@/components/ui/button';
import { useMagic } from '@/context/MagicContext';
import { LogOut } from 'lucide-react';
import { useCallback } from 'react';
import { logout } from '@/utils/common';
import { useAuth } from '@/context/AuthContext';

export function LogOutButton() {
	const { magic } = useMagic();
	const { setToken } = useAuth();

	const disconnect = useCallback(async () => {
		if (!magic) return;
		try {
			await logout(setToken, magic);
			window.location.reload(); // Refresh the page
		} catch (e) {
			console.error('Logout error:', e);
		}
	}, []);
	return (
		<Button
			variant="outline"
			onClick={disconnect}
			className="p-1 text-primary hover:text-primary border border-primary/20 hover:border-primary/40"
		>
			<LogOut className="w-4 h-4 mr-2" />
			Disconnect
		</Button>
	);
}
