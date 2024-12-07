// app/layout.tsx
'use client';

import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import MagicProvider from '@/context/MagicContext';

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
