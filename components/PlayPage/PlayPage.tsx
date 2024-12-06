/* eslint-disable @next/next/no-img-element */
// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Coins, Gamepad2, Gift, ShoppingCart } from 'lucide-react';

export const PlayPage = () => {
	const [count, setCount] = useState(0);
	const [profitPerHour] = useState(15);

	return (
		<div className="flex flex-col h-screen bg-gray-950">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-800">
				<div className="flex items-center gap-2">
					<Avatar>
						<AvatarImage src="/babycat.png" />
						<AvatarFallback>HK</AvatarFallback>
					</Avatar>
					<div>
						<div className="flex items-center gap-1">
							<span className="font-semibold text-white">
								{/* {initData} */}@hello
							</span>
							<BadgeCheck className="w-4 h-4 text-blue-500" />
						</div>
						<div className="text-sm text-gray-400">Bronze 1/11</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Coins className="w-4 h-4 text-yellow-500" />
					<span className="text-white">{count}</span>
				</div>
			</div>

			{/* Profit per hour */}
			<div className="flex justify-center p-2 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20">
				<div className="flex items-center gap-2 text-sm">
					<Coins className="w-4 h-4 text-yellow-500" />
					<span className="text-yellow-500">
						{profitPerHour} coins/hour
					</span>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex flex-col items-center justify-center p-4">
				{/* Clickable hamster circle */}
				<button
					onClick={() => setCount((prev) => prev + 1)}
					className="group relative w-64 h-64 rounded-full transition-all duration-200 active:scale-95"
				>
					{/* Outer ring */}
					<div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 p-1">
						{/* Inner circle with gradient */}
						<div className="w-full h-full rounded-full bg-gradient-radial from-blue-900/50 via-blue-950 to-gray-950 p-4">
							{/* Glow effect */}
							<div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md" />
							{/* Inner shadow */}
							<div className="absolute inset-0 rounded-full shadow-inner" />
							{/* Hamster image */}
							<img
								src="/babycat.png"
								alt="cat"
								className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
							/>
						</div>
					</div>
				</button>

				{/* Counter */}
				<div className="mt-6 text-4xl font-bold text-white">
					{count}
				</div>
				<div className="mt-2 text-gray-400">Tap to earn coins!</div>
			</div>

			{/* Footer Navigation */}
			<div className="border-t border-gray-800 bg-gray-900 text-white">
				<div className="flex justify-around p-4">
					<Button
						variant="ghost"
						className="flex-col gap-1 h-auto py-2"
					>
						<ShoppingCart className="w-5 h-5" />
						<span className="text-xs">Shop</span>
					</Button>
					<Button
						variant="ghost"
						className="flex-col gap-1 h-auto py-2"
					>
						<Gamepad2 className="w-5 h-5" />
						<span className="text-xs">Clicker</span>
					</Button>
					<Button
						variant="ghost"
						className="flex-col gap-1 h-auto py-2"
					>
						<Gift className="w-5 h-5" />
						<span className="text-xs">Earn</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
