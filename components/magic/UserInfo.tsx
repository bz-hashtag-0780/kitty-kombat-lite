'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useMagic } from '@/context/MagicContext';
import { useCallback, useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';
import { convertAccountBalance } from '@/utils/flowUtils';

export const UserInfo = () => {
	const [balance, setBalance] = useState('...');
	const [publicAddress, setPublicAddress] = useState(
		localStorage.getItem('user')
	);
	const { magic } = useMagic();

	useEffect(() => {
		const checkLoginandGetBalance = async () => {
			const isLoggedIn = await magic?.user.isLoggedIn();
			if (isLoggedIn) {
				try {
					const metadata = await magic?.user.getInfo();
					if (metadata) {
						localStorage.setItem('user', metadata.publicAddress!);
						setPublicAddress(metadata.publicAddress!);
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
			const account = await fcl.account(publicAddress);
			setBalance(convertAccountBalance(account.balance));
		}
	}, [magic, publicAddress]);

	return (
		<div>
			<h1>User Info</h1>
			<div>
				{publicAddress?.length == 0
					? 'Fetching address..'
					: publicAddress}
			</div>
			<div className="code">{balance} FLOW</div>
		</div>
	);
};
