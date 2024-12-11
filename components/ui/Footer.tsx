'use client';

import { Button } from '@/components/ui/button';
import { Gamepad2, Gift, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer = () => {
	const pathname = usePathname();

	// Function to determine active styles
	const getActiveStyle = (path: string) => {
		return pathname === path
			? 'text-yellow-500 text-shadow'
			: 'hover:text-white';
	};

	return (
		<div className="border-t border-gray-800 bg-gray-900 text-white">
			<div className="flex justify-around p-4">
				<Link href="/shop">
					<Button
						variant="ghost"
						className={`flex-col gap-1 h-auto py-2 ${getActiveStyle(
							'/shop'
						)}`}
					>
						<ShoppingCart className="w-5 h-5" />
						<span className="text-xs">Shop</span>
					</Button>
				</Link>
				<Link href="/play">
					<Button
						variant="ghost"
						className={`flex-col gap-1 h-auto py-2 ${getActiveStyle(
							'/'
						)} ${getActiveStyle('/play')}`}
					>
						<Gamepad2 className="w-5 h-5" />
						<span className="text-xs">Play</span>
					</Button>
				</Link>
				<Link href="/earn">
					<Button
						variant="ghost"
						className={`flex-col gap-1 h-auto py-2 ${getActiveStyle(
							'/earn'
						)}`}
					>
						<Gift className="w-5 h-5" />
						<span className="text-xs">Earn</span>
					</Button>
				</Link>
			</div>
		</div>
	);
};
