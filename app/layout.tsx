// app/layout.tsx
'use client';
import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body suppressHydrationWarning={true}>
				<AuthContextProvider>{children}</AuthContextProvider>
			</body>
		</html>
	);
}
