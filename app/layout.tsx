// app/layout.tsx
'use client';

import './globals.css';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import MagicProvider from '@/context/MagicContext';
import { AuthContextProvider } from '@/context/AuthContext';
import { AppContextProvider } from '@/context/AppContext';
import * as fcl from '@onflow/fcl';

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
