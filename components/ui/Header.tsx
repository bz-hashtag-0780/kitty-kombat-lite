'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Coins } from 'lucide-react';
import { LoginButton } from '@/components/magic/LoginButton';
import { LoginModal } from '@/components/magic/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';

export const Header = () => {
	const { username, photo_url } = useAuth();
	const {
		count,
		flowBalance,
		publicAddress,
		setShowLoginModal,
		showLoginModal,
		coinBalance,
	} = useAppContext();

	return (
		<div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
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
							@{username ? username : 'anon'}
						</span>
						<BadgeCheck className="w-4 h-4 text-blue-500" />
					</div>
					<div className="text-sm text-gray-400">{publicAddress}</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{publicAddress ? (
					<div>
						<div className="flex items-center gap-1">
							<Coins className="w-3 h-3 text-yellow-500" />
							<span className="text-white text-sm">
								{/* {count} */}
								{coinBalance}
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
	);
};