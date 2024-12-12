'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

interface CoinPopup {
	id: number;
	x: number;
	y: number;
}

const vibrate = () => {
	if (navigator.vibrate) {
		navigator.vibrate([50, 50, 50, 50, 50]);
	}
	if (window.Telegram?.WebApp?.HapticFeedback) {
		window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
		window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
	}
};

const CoinSVG = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle
			cx="12"
			cy="12"
			r="11"
			fill="#FFD700"
			stroke="#FFA500"
			strokeWidth="2"
		/>
		<text
			x="50%"
			y="50%"
			dominantBaseline="middle"
			textAnchor="middle"
			fontSize="14"
			fontWeight="bold"
			fill="#FFA500"
		>
			$
		</text>
	</svg>
);

export const PlayPage = () => {
	const { count, profitPerHour, setCount } = useAppContext();
	const { windowHeight } = useAuth();
	const [coinPopups, setCoinPopups] = useState<CoinPopup[]>([]);

	const headerHeight = 70;
	const footerHeight = 80;
	const contentHeight = windowHeight - headerHeight - footerHeight;

	const handleTap = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			setCount(1);
			vibrate();

			const buttonRect = event.currentTarget.getBoundingClientRect();
			const newCoins = Array.from({ length: 5 }, (_, index) => ({
				id: Date.now() + index,
				x: event.clientX - buttonRect.left + (Math.random() * 40 - 20),
				y: event.clientY - buttonRect.top + (Math.random() * 40 - 20),
			}));

			setCoinPopups((prevPopups) => [...prevPopups, ...newCoins]);
		},
		[setCount]
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setCoinPopups((prevPopups) => prevPopups.slice(5));
		}, 1000);

		return () => clearTimeout(timer);
	}, [coinPopups]);

	useEffect(() => {
		const preventDefault = (e: Event) => e.preventDefault();
		document.addEventListener('touchmove', preventDefault, {
			passive: false,
		});
		return () => document.removeEventListener('touchmove', preventDefault);
	}, []);

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
				className="flex-1 flex flex-col items-center justify-center p-4 relative"
				style={{ height: `${contentHeight}px` }}
			>
				{/* Clickable cat circle */}
				<button
					onClick={handleTap}
					className="group relative w-60 h-60 rounded-full transition-all duration-100 active:scale-95"
					style={{ touchAction: 'manipulation' }}
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
								className="relative w-full h-full object-contain transition-transform duration-100 group-hover:scale-105 group-active:scale-95"
								draggable="false"
							/>
						</div>
					</div>

					{/* Coin popups */}
					{coinPopups.map((coin) => (
						<div
							key={coin.id}
							className="absolute w-6 h-6 animate-coin-popup pointer-events-none"
							style={{ left: `${coin.x}px`, top: `${coin.y}px` }}
						>
							<CoinSVG />
						</div>
					))}
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
