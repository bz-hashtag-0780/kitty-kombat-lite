'use client';

import './globals.css';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import MagicProvider from '@/context/MagicContext';
import { AuthContextProvider } from '@/context/AuthContext';
import { AppContextProvider } from '@/context/AppContext';
import * as fcl from '@onflow/fcl';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

fcl.config({
	'accessNode.api': 'https://rest-mainnet.onflow.org',
});

export const metadata = {
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
		userScalable: 'no',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	useEffect(() => {
		const preventDefault = (e: TouchEvent) => e.preventDefault();
		document.addEventListener('touchmove', preventDefault, {
			passive: false,
		});
		return () => document.removeEventListener('touchmove', preventDefault);
	}, []);

	return (
		<html lang="en">
			<body
				suppressHydrationWarning={true}
				className="flex flex-col h-screen overflow-hidden"
			>
				<MagicProvider>
					<AuthContextProvider>
						<AppContextProvider>
							<ToastContainer
								position="bottom-right"
								pauseOnFocusLoss={true}
								theme="dark"
							/>
							<Header />
							<main className="flex-1 overflow-y-auto">
								{children}
							</main>
							<Footer />
						</AppContextProvider>
					</AuthContextProvider>
				</MagicProvider>
			</body>
		</html>
	);
}
