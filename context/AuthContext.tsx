'use client';

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	Dispatch,
	SetStateAction,
} from 'react';
import WebApp from '@twa-dev/sdk';

type AuthContextType = {
	userID: number | null;
	username: string | null;
	windowHeight: number;
	photo_url: string | null;
	token: string;
	setToken: Dispatch<SetStateAction<string>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [windowHeight, setWindowHeight] = useState<number>(0);
	const [userID, setUserID] = useState<number | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [photo_url, setPhotoUrl] = useState<string | null>(null);
	const [token, setToken] = useState('');

	useEffect(() => {
		// Ensure this code only runs on the client side
		if (typeof window !== 'undefined' && WebApp) {
			WebApp.isVerticalSwipesEnabled = false;
			setWindowHeight(WebApp.viewportStableHeight || window.innerHeight);
			WebApp.ready();

			WebApp.expand();

			// Set Telegram user data
			const user = WebApp.initDataUnsafe.user;
			setUserID(user?.id || null);
			setUsername(user?.username || null);
			setPhotoUrl(user?.photo_url || null);
		}
		setToken(localStorage.getItem('token') ?? '');
	}, []);

	const contextValue = {
		userID,
		username,
		windowHeight,
		photo_url,
		token,
		setToken,
	};

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthContextProvider');
	}
	return context;
};
