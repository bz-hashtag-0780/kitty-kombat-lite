/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

// Define the structure for an upgrade item
interface Upgrade {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
}

// Sample upgrade data
const upgrades: Upgrade[] = [
	{
		id: '1',
		name: 'Speed Booster',
		description: '10%',
		price: 100,
		image: '/speed_booster.webp',
	},
	{
		id: '2',
		name: 'Mega Tapper',
		description: '100%',
		price: 250,
		image: '/mega_tapper.webp',
	},
];

export const ShopPage = () => {
	const { coinBalance } = useAppContext();
	const { windowHeight } = useAuth();

	// Define header and footer heights
	const headerHeight = 70;
	const footerHeight = 80;
	const contentHeight = windowHeight - headerHeight - footerHeight;

	const handleBuyUpgrade = (upgrade: Upgrade) => {
		if (coinBalance >= upgrade.price) {
			//   buyUpgrade(upgrade.id, upgrade.price);
		} else {
			// You might want to show a toast or alert here
			console.log('Not enough coins to buy this upgrade!');
		}
	};

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
			<div className="flex-1 overflow-y-auto p-4">
				<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{upgrades.map((upgrade) => (
						<Card
							key={upgrade.id}
							className="bg-gray-900 text-white border-gray-800"
						>
							<CardHeader>
								<CardTitle>{upgrade.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<img
									src={upgrade.image}
									alt={upgrade.name}
									className="w-full object-cover rounded-md mb-2"
								/>
								<p className="text-sm text-gray-400">
									{upgrade.description}
								</p>
							</CardContent>
							<CardFooter className="flex justify-between items-center">
								<span className="text-yellow-500">
									{upgrade.price} coins
								</span>
								<Button
									onClick={() => handleBuyUpgrade(upgrade)}
									disabled={coinBalance < upgrade.price}
								>
									Buy
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
};
