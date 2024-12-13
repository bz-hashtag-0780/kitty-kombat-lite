'use client';

import { Gamepad2, Gift, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer = () => {
	const pathname = usePathname();

	// Function to determine active styles
	const getActiveStyle = (path: string) => {
		return pathname === path ? 'text-yellow-500 text-shadow' : '';
	};

	return (
		<div className="border-t border-gray-800 bg-gray-900 text-white h-26">
			<div className="flex justify-around">
				<Link
					href="/shop"
					className={`flex flex-col items-center gap-2 p-4 h-24 w-full text-center ${getActiveStyle(
						'/shop'
					)}`}
				>
					<ShoppingCart className="w-6 h-6" />
					<span className="text-xs">Shop</span>
				</Link>
				<Link
					href="/play"
					className={`flex flex-col items-center gap-2 p-4 h-24 w-full text-center ${getActiveStyle(
						'/'
					)} ${getActiveStyle('/play')}`}
				>
					<Gamepad2 className="w-6 h-6" />
					<span className="text-xs">Play</span>
				</Link>
				<Link
					href="/earn"
					className={`flex flex-col items-center gap-2 p-4 h-24 w-full text-center ${getActiveStyle(
						'/earn'
					)}`}
				>
					<Gift className="w-6 h-6" />
					<span className="text-xs">Earn</span>
				</Link>
			</div>
		</div>
	);
};
