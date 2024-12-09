/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Coins, Gamepad2, Gift, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMagic } from '@/context/MagicContext';
import { LoginButton } from '@/components/magic/LoginButton';
import { LoginModal } from '@/components/magic/LoginModal';
import * as fcl from '@onflow/fcl';

export const PlayPage = () => {
	const [count, setCount] = useState(0);
	const [profitPerHour] = useState(15);
	const [publicAddress, setPublicAddress] = useState<string | null>(null);
	const [flowBalance, setFlowBalance] = useState(0);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { username, photo_url } = useAuth();
	const { magic } = useMagic();

	useEffect(() => {
		// Check if we're in the client-side environment
		if (typeof window !== 'undefined') {
			// Get the public address from localStorage
			const savedAddress = localStorage.getItem('user');
			setPublicAddress(savedAddress);

			if (savedAddress) {
				fetchFlowBalance(savedAddress); // Fetch balance if address exists
			}
		}

		const checkLogin = async () => {
			const isLoggedIn = await magic?.user.isLoggedIn();
			if (isLoggedIn) {
				try {
					const metadata = await magic?.user.getInfo();
					if (metadata) {
						if (typeof window !== 'undefined') {
							// Store the address in localStorage only on the client side
							localStorage.setItem(
								'user',
								metadata.publicAddress!
							);
							setPublicAddress(metadata.publicAddress!);
						}
					}
				} catch (e) {
					console.log('error in fetching address: ' + e);
				}
			}
		};
		setTimeout(() => checkLogin(), 5000);
	}, [magic]);

	const fetchFlowBalance = async (address: string) => {
		try {
			const balance = await fcl.query({
				cadence: `
			  	import FungibleToken from 0xf233dcee88fe0abe
				import FlowToken from 0x1654653399040a61

				access(all) fun main(account: Address): UFix64 {
					let vaultRef = getAccount(account)
						.capabilities.borrow<&FlowToken.Vault>(/public/flowTokenBalance)
						?? panic("Could not borrow a balance reference to the FlowToken Vault in account")

					return vaultRef.balance
				}
			`,
				args: (arg: any, t: any) => [arg(address, t.Address)],
			});
			setFlowBalance(parseFloat(balance));
		} catch (error) {
			console.error('Failed to fetch Flow balance:', error);
		}
	};

	const addCoins = useCallback(async () => {}, []);

	return (
		<div className="flex flex-col h-screen bg-gray-950">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-800">
				<div className="flex items-center gap-2">
					<Avatar>
						{photo_url ? (
							<AvatarImage src={photo_url} />
						) : (
							<AvatarImage src="/babycat.png" />
						)}

						<AvatarFallback>HK</AvatarFallback>
					</Avatar>
					<div>
						<div className="flex items-center gap-1">
							<span className="font-semibold text-white">
								@{username ? <>{username}</> : 'anon'}
							</span>
							<BadgeCheck className="w-4 h-4 text-blue-500" />
						</div>
						<div className="text-sm text-gray-400">
							{publicAddress}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{publicAddress ? (
						<div>
							<div className="flex items-center gap-1">
								<Coins className="w-3 h-3 text-yellow-500" />
								<span className="text-white text-sm">
									{count}
								</span>
							</div>
							{flowBalance && (
								<div className="flex items-center gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 176.99 176.15"
										className="w-4 h-4 -ml-1"
									>
										<circle
											cx="88.49"
											cy="88.07"
											r="87.19"
											style={{ fill: '#12E987' }}
										></circle>
										<path
											d="M59.09 110.21a9.52 9.52 0 1 0 19 0v-9.53h-9.48a9.53 9.53 0 0 0-9.52 9.53"
											fill="none"
										></path>
										<path
											d="M103.53 75.29h25.39v25.39h-25.39zM78.13 110.21a9.52 9.52 0 1 1-9.52-9.53h9.52V75.29h-9.52a34.92 34.92 0 1 0 34.91 34.92v-9.53H78.13Z"
											fill="#fff"
										></path>
										<path
											d="M113.05 62.6h28.56V37.2h-28.56a35 35 0 0 0-34.92 34.92v3.17h25.39v-3.17a9.53 9.53 0 0 1 9.53-9.52"
											fill="#fff"
										></path>
										<path
											d="M78.13 100.68H103.53V75.29H78.13z"
											style={{
												fill: '#12E987',
											}}
										></path>
									</svg>
									<span className="text-white text-sm">
										{flowBalance.toFixed(2)}
									</span>
								</div>
							)}
						</div>
					) : (
						<LoginButton onClick={() => setShowLoginModal(true)} />
					)}
				</div>
				<LoginModal
					open={showLoginModal}
					onOpenChange={setShowLoginModal}
				/>
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
