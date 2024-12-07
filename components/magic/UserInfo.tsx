'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useMagic } from '@/context/MagicContext';
import { useCallback, useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';
import { convertAccountBalance } from '@/utils/flowUtils';

export const UserInfo = () => {
	const [balance, setBalance] = useState('...');
	const [publicAddress, setPublicAddress] = useState<string | null>(null); // Initialize with null
	const { magic } = useMagic();

	useEffect(() => {
		// Check if we're in the client-side environment
		if (typeof window !== 'undefined') {
			// Get the public address from localStorage
			const savedAddress = localStorage.getItem('user');
			setPublicAddress(savedAddress);
		}

		const checkLoginandGetBalance = async () => {
			const isLoggedIn = await magic?.user.isLoggedIn();
			if (isLoggedIn) {
				try {
					const metadata = await magic?.user.getInfo();
					if (metadata) {
						if (typeof window !== 'undefined') {
							// Store the address in localStorage only on the client side
							localStorage.setItem(
								'user',
								metadata.publicAddress!
							);
							setPublicAddress(metadata.publicAddress!);
						}
					}
					getBalance();
				} catch (e) {
					console.log('error in fetching address: ' + e);
				}
			}
		};

		setTimeout(() => checkLoginandGetBalance(), 5000);
	}, [magic]);

	const getBalance = useCallback(async () => {
		if (publicAddress) {
			try {
				const account = await fcl.account(publicAddress);
				setBalance(convertAccountBalance(account.balance));
			} catch (e) {
				console.log('Error fetching balance:', e);
			}
		}
	}, [magic, publicAddress]);

	return (
		<div>
			<h1>User Info</h1>
			<div>{!publicAddress ? 'Fetching address...' : publicAddress}</div>
			<div className="code">{balance} FLOW</div>
		</div>
	);
};
