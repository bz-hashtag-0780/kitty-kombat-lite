/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

// interface Upgrade {
// 	id: string;
// 	name: string;
// 	description: string;
// 	price: number;
// 	image: string;
// 	level: number;
// 	cps: string;
// }

// const upgrades: Upgrade[] = [
// 	{
// 		id: '1',
// 		name: 'Speed Booster',
// 		description: 'Boosts your clicking speed',
// 		price: 100,
// 		image: '/speed_booster.webp',
// 		level: 1,
// 		cps: '+0.1',
// 	},
// 	{
// 		id: '2',
// 		name: 'Mega Tapper',
// 		description: 'Automatically taps for you',
// 		price: 250,
// 		image: '/mega_tapper.webp',
// 		level: 0,
// 		cps: '+1.0',
// 	},
// ];

const imageMapping = [
	{ name: 'Speed Booster', image: '/speed_booster.webp' },
	{ name: 'Mega Tapper', image: '/mega_tapper.webp' },
	// Add more mappings as needed
];

// Helper function to get the image URL for a given upgrade name
const getImageForUpgrade = (name: string) => {
	const mapping = imageMapping.find((item) => item.name === name);
	return mapping ? mapping.image : '/default_upgrade.webp'; // Fallback to a default image
};

// Helper function to format multiplier
const formatMultiplier = (multiplier: string | number) => {
	// Convert to a number and format to a maximum of one decimal place
	const num = parseFloat(multiplier as string);
	return `${num % 1 === 0 ? num : num.toFixed(1)}x`;
};

export const ShopPage = () => {
	const { coinBalance, upgrades, playerUpgrades, purchaseUpgrade } =
		useAppContext();
	const { windowHeight } = useAuth();

	const headerHeight = 70;
	const footerHeight = 80;
	const contentHeight = windowHeight - headerHeight - footerHeight;

	// Combine upgrades with player levels
	const enrichedUpgrades = upgrades.map((upgrade: any) => ({
		...upgrade,
		level: playerUpgrades[upgrade.name] || 0, // Default to level 0 if not found
	}));

	return (
		<div
			className="flex flex-col bg-gray-950"
			style={{ height: `${contentHeight}px` }}
		>
			{/* Balance info */}
			<div className="flex justify-center p-2 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20">
				<div className="flex items-center gap-2 text-sm">
					<Coins className="w-4 h-4 text-yellow-500" />
					<span className="text-yellow-500">{coinBalance} coins</span>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-y-auto p-4 space-y-2">
				{enrichedUpgrades.map((upgrade: any) => (
					<div
						key={upgrade.id}
						className="flex items-center bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors duration-200 border border-gray-800"
						onClick={() =>
							purchaseUpgrade(upgrade.name, upgrade.price)
						}
					>
						{/* Left: Image */}
						<div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
							<img
								src={getImageForUpgrade(upgrade.name)}
								alt={upgrade.name}
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Center: Name and Price */}
						<div className="flex-1 px-4">
							<h3 className="text-lg font-semibold text-white">
								{upgrade.name}
							</h3>
							<p className="text-xs text-gray-400">
								{upgrade.description}
							</p>
							<div className="flex items-center gap-1">
								<Coins className="w-4 h-4 text-yellow-500" />
								<span className="text-yellow-500">
									{upgrade.price}
								</span>
							</div>
						</div>

						{/* Right: Level and Multiplier */}
						<div className="text-right">
							<div className="text-lg font-bold text-white">
								Level {upgrade.level || 0}
							</div>
							<div className="text-sm text-green-400">
								Multiplier{' '}
								{formatMultiplier(upgrade.multiplier)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
