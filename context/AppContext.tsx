/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	Dispatch,
	SetStateAction,
	ReactNode,
} from 'react';
import * as fcl from '@onflow/fcl';
import { useMagic } from '@/context/MagicContext';

type AppContextType = {
	count: number;
	setCount: Dispatch<SetStateAction<number>>;
	flowBalance: number;
	publicAddress: string | null;
	showLoginModal: boolean;
	setShowLoginModal: Dispatch<SetStateAction<boolean>>;
	isTransactionInProgress: boolean;
	addCoins: () => Promise<void>;
	profitPerHour: number;
	coinBalance: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const [count, setCount] = useState(0.0);
	const [profitPerHour] = useState(15);
	const [publicAddress, setPublicAddress] = useState<string | null>(null);
	const [coinBalance, setCoinBalance] = useState(0);
	const [flowBalance, setFlowBalance] = useState(0);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [isTransactionInProgress, setIsTransactionInProgress] =
		useState(false);

	const { magic } = useMagic();

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedAddress = localStorage.getItem('user');
			setPublicAddress(savedAddress);

			if (savedAddress) {
				fetchFlowBalance(savedAddress);
				fetchCoins(savedAddress);
			}
		}

		const checkLogin = async () => {
			const isLoggedIn = await magic?.user.isLoggedIn();
			if (isLoggedIn) {
				try {
					const metadata = await magic?.user.getInfo();
					if (metadata) {
						localStorage.setItem('user', metadata.publicAddress!);
						setPublicAddress(metadata.publicAddress!);
					}
				} catch (e) {
					console.error('Error in fetching address:', e);
				}
			}
		};

		setTimeout(() => checkLogin(), 5000);
	}, [magic]);

	const fetchFlowBalance = async (address: string) => {
		try {
			const balance = await fcl.query({
				cadence: `
                import FungibleToken from 0xf233dcee88fe0abe
                import FlowToken from 0x1654653399040a61

                access(all) fun main(account: Address): UFix64 {
                    let vaultRef = getAccount(account)
                        .capabilities.borrow<&FlowToken.Vault>(/public/flowTokenBalance)
                        ?? panic("Could not borrow a balance reference to the FlowToken Vault in account")
                    return vaultRef.balance
                }
            `,
				args: (arg: any, t: any) => [arg(address, t.Address)],
			});
			setFlowBalance(parseFloat(balance));
		} catch (error) {
			console.error('Failed to fetch Flow balance:', error);
		}
	};

	const fetchCoins = async (address: string) => {
		try {
			const balance = await fcl.query({
				cadence: `
                import KittyKombatLite from 0x87535df35d7f64e1

				access(all) fun main(address: Address): UFix64 {
					let account = getAccount(address)
					let player = account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath)
						?? panic("Could not borrow a reference to the player")
					
					return player.coins
				}
            `,
				args: (arg: any, t: any) => [arg(address, t.Address)],
			});
			setCoinBalance(parseFloat(balance));
		} catch (error) {
			console.error('Failed to fetch Coin balance:', error);
		}
	};

	const addCoins = useCallback(async () => {
		if (!magic) return;

		if (!publicAddress || count <= 0) {
			console.error('No public address or no points to add.');
			return;
		}

		if (isTransactionInProgress) {
			alert('Transaction already in progress. Skipping...');
			return;
		}

		setIsTransactionInProgress(true);

		try {
			const transactionId = await fcl.mutate({
				cadence: `
                import KittyKombatLite from 0x87535df35d7f64e1

                transaction(amount: UFix64) {
                  prepare(acct: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
                    if acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) == nil {
                      acct.storage.save(<- KittyKombatLite.createPlayer(), to: KittyKombatLite.PlayerStoragePath)
                      let playerCap = acct.capabilities.storage.issue<&KittyKombatLite.Player>(KittyKombatLite.PlayerStoragePath)
                      acct.capabilities.publish(playerCap, at: KittyKombatLite.PlayerPublicPath)
                    }

                    let playerRef = acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) ?? panic("Could not borrow a reference to the player")
                    playerRef.addCoins(amount: amount)
                  }
                  execute {}
                }
              `,
				args: (arg: any, t: any) => [arg(count.toFixed(2), t.UFix64)],
				proposer: magic.flow.authorization,
				authorizations: [magic.flow.authorization],
				payer: magic.flow.authorization,
				limit: 9999,
			});

			console.log('Transaction submitted with ID:', transactionId);
			alert('Transaction submitted');
			setCount(0.0);
		} catch (error) {
			console.error('Failed to send transaction:', error);
			alert('Transaction failed');
		} finally {
			setIsTransactionInProgress(false);
		}
	}, [magic, count, publicAddress, isTransactionInProgress]);

	useEffect(() => {
		const POINT_THRESHOLD = 10.0;

		if (count >= POINT_THRESHOLD && !isTransactionInProgress) {
			addCoins();
		}
	}, [count, addCoins, isTransactionInProgress]);

	useEffect(() => {
		const TIMER_INTERVAL = 5 * 60 * 1000;

		const timer = setInterval(() => {
			if (count > 0.0 && !isTransactionInProgress) {
				addCoins();
			}
		}, TIMER_INTERVAL);

		return () => clearInterval(timer);
	}, [count, addCoins, isTransactionInProgress]);

	return (
		<AppContext.Provider
			value={{
				count,
				setCount,
				flowBalance,
				publicAddress,
				showLoginModal,
				setShowLoginModal,
				isTransactionInProgress,
				addCoins,
				profitPerHour,
				coinBalance,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useAppContext must be used within AppContextProvider');
	}
	return context;
};