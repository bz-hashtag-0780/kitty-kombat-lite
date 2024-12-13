'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/EarnPage/ui/button';
import { Input } from '@/components/EarnPage/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowUpRight, Copy } from 'lucide-react';
import { LogOutButton } from '@/components/magic/LogOutButton';
import { LoginButton } from '@/components/magic/LoginButton';
import { toast } from 'react-toastify';

export const EarnPage = () => {
	const {
		coinBalance,
		flowBalance,
		publicAddress,
		withdrawAddress,
		withdrawAmount,
		setWithdrawAddress,
		setWithdrawAmount,
		transferFlow,
		setShowLoginModal,
	} = useAppContext();

	return (
		<div className="flex flex-col h-full bg-gray-950">
			{/* Balance info */}
			<div className="flex justify-center p-2 bg-gradient-to-r from-blue-600/20 to-purple-500/20 h-11">
				<div className="flex items-center gap-2 text-sm">
					<Wallet className="w-4 h-4 text-blue-500" />
					<span className="text-blue-500">
						{flowBalance.toFixed(2)} FLOW |{' '}
						{new Intl.NumberFormat().format(coinBalance)} Coins
					</span>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6 overflow-y-auto">
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
						<CardTitle>Fund Your Flow Address</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-mono text-sm break-all flex flex-row gap-x-1 items-center">
							<span className="text-gray-400">Balance:</span>{' '}
							{flowBalance.toFixed(6)} FLOW
						</p>
						<p className="font-mono text-sm break-all flex flex-row gap-x-1 items-center cursor-pointer active:text-gray-500">
							<span className="text-gray-400">Address:</span>
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
						<div className="flex flex-col space-y-2">
							<div className="flex space-x-2">
								<Input
									type="text"
									placeholder="Address"
									value={withdrawAddress}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setWithdrawAddress(e.target.value)}
									className="bg-gray-800 border-gray-700 text-white flex-grow"
								/>
								<Input
									type="number"
									placeholder="Amount"
									value={withdrawAmount}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setWithdrawAmount(e.target.value)}
									className="bg-gray-800 border-gray-700 text-white w-24"
								/>
							</div>
							<Button
								onClick={() => transferFlow()}
								className="whitespace-nowrap w-full bg-gray-600 hover:bg-gray-700"
								variant="ghost"
							>
								Withdraw{' '}
								<ArrowUpRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="w-full max-w-md bg-gray-900 text-white border-gray-800">
					<CardHeader>
						<CardTitle>
							Airdrop:{' '}
							{new Intl.NumberFormat().format(coinBalance)} coins
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-400">
							Keep earning and stay active for a chance to
							participate in future airdrops!
						</p>
					</CardContent>
				</Card>

				{!publicAddress ? (
					<LoginButton onClick={() => setShowLoginModal(true)} />
				) : (
					<LogOutButton />
				)}
			</div>
		</div>
	);
};
