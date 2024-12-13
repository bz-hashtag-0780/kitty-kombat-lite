'use client';

// import { useEffect } from 'react';
import * as fcl from '@onflow/fcl';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import MagicProvider from '@/context/MagicContext';
import { AuthContextProvider } from '@/context/AuthContext';
import { AppContextProvider } from '@/context/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

fcl.config({
	'accessNode.api': 'https://rest-mainnet.onflow.org',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// useEffect(() => {
	// 	// Set viewport meta tag
	// 	const meta = document.createElement('meta');
	// 	meta.name = 'viewport';
	// 	meta.content =
	// 		'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
	// 	document.getElementsByTagName('head')[0].appendChild(meta);
	// }, []);

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
