'use client';

import { Button } from '@/components/ui/button';
import { Gamepad2, Gift, ShoppingCart } from 'lucide-react';

export const Footer = () => (
	<div className="border-t border-gray-800 bg-gray-900 text-white">
		<div className="flex justify-around p-4">
			<Button variant="ghost" className="flex-col gap-1 h-auto py-2">
				<ShoppingCart className="w-5 h-5" />
				<span className="text-xs">Shop</span>
			</Button>
			<Button variant="ghost" className="flex-col gap-1 h-auto py-2">
				<Gamepad2 className="w-5 h-5" />
				<span className="text-xs">Clicker</span>
			</Button>
			<Button variant="ghost" className="flex-col gap-1 h-auto py-2">
				<Gift className="w-5 h-5" />
				<span className="text-xs">Earn</span>
			</Button>
		</div>
	</div>
);
