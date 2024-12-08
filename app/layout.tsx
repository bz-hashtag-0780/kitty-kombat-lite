// app/layout.tsx
'use client';

import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import MagicProvider from '@/context/MagicContext';
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
					<AuthContextProvider>{children}</AuthContextProvider>
				</MagicProvider>
			</body>
		</html>
	);
}
