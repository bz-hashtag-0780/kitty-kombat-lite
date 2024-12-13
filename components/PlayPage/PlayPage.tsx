'use client';

import React, { useState, useEffect } from 'react';
import { Coins, Clock } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

declare global {
	interface Window {
		Telegram?: {
			WebApp?: {
				HapticFeedback?: {
					impactOccurred: (
						style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
					) => void;
					notificationOccurred: (
						type: 'error' | 'success' | 'warning'
					) => void;
				};
			};
		};
	}
}

const vibrate = () => {
	if (navigator.vibrate) {
		navigator.vibrate([50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
	}
	if (window.Telegram?.WebApp?.HapticFeedback) {
		window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
		setTimeout(() => {
			if (window.Telegram?.WebApp?.HapticFeedback) {
				window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
			}
		}, 100);
		setTimeout(() => {
			if (window.Telegram?.WebApp?.HapticFeedback) {
				window.Telegram.WebApp.HapticFeedback.notificationOccurred(
					'success'
				);
			}
		}, 200);
	}
};

export const PlayPage = () => {
	const {
		count,
		passiveEarnings,
		lastClaimTimestamp,
		setCount,
		claimPassiveCoins,
	} = useAppContext();
	const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');
	const [canClaim, setCanClaim] = useState(false);

	const handleTap = () => {
		setCount(1);
		vibrate();
	};

	useEffect(() => {
		const updateClaimTimer = () => {
			const now = Date.now() / 1000; // Current time in seconds
			const nextClaimTime = Math.floor(lastClaimTimestamp) + 3600; // 1 hour cooldown
			console.log('Last claim timestamp:', lastClaimTimestamp);
			console.log('Next claim time:', nextClaimTime);
			const timeLeft = Math.max(0, nextClaimTime - now);

			if (timeLeft > 0) {
				const minutes = Math.floor(timeLeft / 60);
				const seconds = Math.floor(timeLeft % 60);
				setTimeUntilNextClaim(
					`${minutes}:${seconds.toString().padStart(2, '0')}`
				);
				setCanClaim(false);
			} else {
				setTimeUntilNextClaim('Claim now!');
				setCanClaim(true);
			}
		};

		updateClaimTimer();
		const interval = setInterval(updateClaimTimer, 1000);
		return () => clearInterval(interval);
	}, [lastClaimTimestamp]);

	const handleClaim = () => {
		if (canClaim) {
			claimPassiveCoins();
			setCanClaim(false);
			setTimeUntilNextClaim('59:59'); // Set to max time immediately after claim
		}
	};

	return (
		<div className="flex flex-col bg-gray-950 select-none">
			{/* Passive earnings banner */}
			<div className="flex justify-between items-center p-2 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 h-11">
				<div className="flex items-center gap-2 text-sm">
					<Coins className="w-4 h-4 text-yellow-500" />
					<span className="text-yellow-500">
						{passiveEarnings.toFixed(2)} coins/hour
					</span>
				</div>
				<button
					onClick={handleClaim}
					disabled={!canClaim}
					className="flex items-center gap-2 text-sm bg-yellow-500 text-gray-900 px-2 py-1 rounded-full disabled:opacity-50"
				>
					<Clock className="w-4 h-4" />
					{timeUntilNextClaim}
				</button>
			</div>

			{/* Main content */}
			<div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto mt-12">
				{/* Clickable cat circle */}
				<button
					onClick={handleTap}
					className="group relative w-80 h-80 rounded-full transition-all duration-200 active:scale-95"
				>
					{/* Outer ring */}
					<div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 p-1">
						{/* Inner circle with gradient */}
						<div className="w-full h-full rounded-full bg-gradient-radial from-blue-900/50 via-blue-950 to-gray-950 p-4">
							{/* Glow effect */}
							<div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md" />
							{/* Inner shadow */}
							<div className="absolute inset-0 rounded-full shadow-inner" />
							{/* Cat image */}
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
					{new Intl.NumberFormat().format(count)}
				</div>
				<div className="mt-2 text-gray-400">Tap to earn coins!</div>
			</div>
		</div>
	);
};
