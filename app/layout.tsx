// app/layout.tsx
'use client';

import { Footer } from '@/components/ui/Footer';
import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import MagicProvider from '@/context/MagicContext';
import * as fcl from '@onflow/fcl';
import { Header } from '@/components/ui/Header';
import { AppContextProvider } from '@/context/AppContext';

fcl.config({
	'accessNode.api': 'https://rest-mainnet.onflow.org',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body suppressHydrationWarning={true}>
				<MagicProvider>
					<AuthContextProvider>
						<AppContextProvider>
							<Header />
							{children}
							<Footer />
						</AppContextProvider>
					</AuthContextProvider>
				</MagicProvider>
			</body>
		</html>
	);
}
