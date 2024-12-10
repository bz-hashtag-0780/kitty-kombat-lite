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
	profitPerHour: number;
	coinBalance: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const [localCount, setLocalCount] = useState(0.0); // Local taps count
	const [smartContractBalance, setSmartContractBalance] = useState(0.0); // On-chain balance
	const [profitPerHour] = useState(15);
	const [publicAddress, setPublicAddress] = useState<string | null>(null);
	const [flowBalance, setFlowBalance] = useState(0);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const isTransactionInProgressRef = React.useRef(false); // Ref for transaction progress

	const { magic } = useMagic();

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedAddress = localStorage.getItem('user');
			setPublicAddress(savedAddress);

			if (savedAddress) {
				fetchFlowBalance(savedAddress);
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

	const fetchCoins = useCallback(async (address: string) => {
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
			setSmartContractBalance(parseFloat(balance));
		} catch (error) {
			console.error('Failed to fetch Coin balance:', error);
		}
	}, []);

	useEffect(() => {
		if (publicAddress) {
			fetchCoins(publicAddress); // Fetch balance on mount
		}
	}, [publicAddress, fetchCoins]);

	const addCoins = useCallback(
		async (countDiff: number) => {
			if (!magic || !publicAddress || countDiff <= 0) return;

			if (isTransactionInProgressRef.current) {
				console.warn('Transaction already in progress');
				alert('Transaction already in progress');
				return;
			}

			isTransactionInProgressRef.current = true;

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
					args: (arg: any, t: any) => [
						arg(countDiff.toFixed(2), t.UFix64),
					],
					proposer: magic.flow.authorization,
					authorizations: [magic.flow.authorization],
					payer: magic.flow.authorization,
					limit: 9999,
				});

				console.log('Transaction submitted with ID:', transactionId);
				alert('Transaction submitted!');

				// Fetch updated balance
				await fetchCoins(publicAddress);
			} catch (error) {
				console.error('Failed to send transaction:', error);
			} finally {
				isTransactionInProgressRef.current = false;
			}
		},
		[magic, publicAddress, fetchCoins]
	);

	// Timer-based transaction every 8 seconds
	useEffect(() => {
		const syncWithOnChain = async () => {
			console.log('Syncing with on-chain balance...');

			if (!publicAddress || isTransactionInProgressRef.current) {
				console.log(
					'Skipping sync: either no publicAddress or transaction in progress'
				);
				return;
			}

			console.log('Fetching on-chain balance...');
			await fetchCoins(publicAddress);

			// Calculate the count difference
			const countDiff = localCount; // Local taps that haven't been saved
			console.log('Local count:', localCount);
			console.log('On-chain count:', smartContractBalance);
			console.log('Count difference (to save):', countDiff);

			if (countDiff > 0) {
				console.log('Sending coins to on-chain balance...');
				// Send the difference (max 50 per transaction)
				const amountToSend = Math.min(countDiff, 50);
				await addCoins(amountToSend);

				// Decrease local count by the amount sent
				setLocalCount((prev) => prev - amountToSend);
			}
		};

		const timer = setTimeout(syncWithOnChain, 8000); // 8 seconds

		return () => clearTimeout(timer); // Cleanup on unmount
	}, [publicAddress, localCount, smartContractBalance, addCoins, fetchCoins]);

	return (
		<AppContext.Provider
			value={{
				count: localCount + smartContractBalance, // Smooth total display
				setCount: setLocalCount, // Increment local count
				flowBalance,
				publicAddress,
				showLoginModal,
				setShowLoginModal,
				isTransactionInProgress: isTransactionInProgressRef.current,
				profitPerHour,
				coinBalance: smartContractBalance,
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
