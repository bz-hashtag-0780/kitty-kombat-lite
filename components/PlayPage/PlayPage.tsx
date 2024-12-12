'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

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

export const PlayPage = () => {
	const { count, profitPerHour, setCount } = useAppContext();
	const { windowHeight } = useAuth();

	const headerHeight = 70;
	const footerHeight = 80;
	const contentHeight = windowHeight - headerHeight - footerHeight;

	const vibrate = () => {
		if (navigator.vibrate) {
			// Create a pattern similar to catching a shiny Pokémon:
			// 5 short vibrations with brief pauses in between
			navigator.vibrate([50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
		}
		// Telegram Web App vibration
		if (window.Telegram?.WebApp?.HapticFeedback) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');

			setTimeout(() => {
				if (window.Telegram?.WebApp?.HapticFeedback) {
					window.Telegram.WebApp.HapticFeedback.impactOccurred(
						'medium'
					);
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

	const handleTap = () => {
		setCount(1);
		vibrate();
	};

	return (
		<div
			className="flex flex-col bg-gray-950 select-none"
			style={{ height: `${contentHeight}px` }}
		>
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
			<div
				className="flex-1 flex flex-col items-center justify-center p-4"
				style={{ height: `${contentHeight}px` }}
			>
				{/* Clickable cat circle */}
				<button
					onClick={handleTap}
					className="group relative w-60 h-60 rounded-full transition-all duration-200 active:scale-95"
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
					{count}
				</div>
				<div className="mt-2 text-gray-400">Tap to earn coins!</div>
			</div>
		</div>
	);
};
