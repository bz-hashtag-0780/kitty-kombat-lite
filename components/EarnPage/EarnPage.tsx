/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Wallet, ArrowUpRight, LogOut, Copy } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/EarnPage/ui/input';
import { toast } from 'react-toastify';

export const EarnPage = () => {
	const { coinBalance, flowBalance, publicAddress } = useAppContext();
	const { windowHeight } = useAuth();
	const [withdrawAmount, setWithdrawAmount] = React.useState('');

	// Define header and footer heights
	const headerHeight = 70;
	const footerHeight = 80;
	const contentHeight = windowHeight - headerHeight - footerHeight;

	const handleWithdraw = () => {
		// Implement withdraw logic here
		console.log(`Withdrawing ${withdrawAmount} FLOW`);
	};

	return (
		<div
			className="flex flex-col bg-gray-950"
			style={{ height: `${contentHeight}px` }}
		>
			{/* Balance info */}
			<div className="flex justify-center p-2 bg-gradient-to-r from-blue-600/20 to-purple-500/20">
				<div className="flex items-center gap-2 text-sm">
					<Wallet className="w-4 h-4 text-blue-500" />
					<span className="text-blue-500">
						{flowBalance} FLOW | {coinBalance} Coins
					</span>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
				<Card
					className="w-full max-w-md bg-gray-900 text-white border-gray-800 cursor-pointer"
					onClick={() => {
						if (publicAddress) {
							navigator.clipboard.writeText(publicAddress);
							toast('Address copied to clipboard!', {
								autoClose: 2000,
							});
						}
					}}
				>
					<CardHeader>
						<CardTitle>Your Wallet</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-400 mb-2">Address:</p>
						<p className="font-mono text-sm break-all flex flex-row gap-x-1 items-center">
							{publicAddress}
							<Copy className="mr-2 h-3 w-3" />
						</p>
					</CardContent>
				</Card>

				<Card className="w-full max-w-md bg-gray-900 text-white border-gray-800">
					<CardHeader>
						<CardTitle>Withdraw FLOW</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex space-x-2">
							<Input
								type="number"
								placeholder="Amount"
								value={withdrawAmount}
								onChange={(e: any) =>
									setWithdrawAmount(e.target.value)
								}
								className="bg-gray-800 border-gray-700 text-white"
							/>
							<Button
								onClick={handleWithdraw}
								className="whitespace-nowrap"
							>
								Withdraw{' '}
								<ArrowUpRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="w-full max-w-md bg-gray-900 text-white border-gray-800">
					<CardHeader>
						<CardTitle>Airdrop: {coinBalance} coins</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-400">
							Keep earning and stay active for a chance to
							participate in future airdrops!
						</p>
					</CardContent>
				</Card>

				<Button variant="outline" className="mt-4 p-2">
					<LogOut className="mr-2 h-4 w-4" /> Log Out
				</Button>
			</div>
		</div>
	);
};
