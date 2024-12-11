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
import { toast } from 'react-toastify';
import { toastStatus } from '@/utils/toastStatus';

type AppContextType = {
	count: number;
	setCount: (increment: number) => void;
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
	// Load initial localCount from localStorage
	// const [localCount, setLocalCountState] = useState<number>(() => {
	// 	const savedCount = localStorage.getItem('localCount');
	// 	const parsedCount = parseFloat(savedCount || '0'); // Fallback to 0 if invalid
	// 	return isNaN(parsedCount) ? 0.0 : parsedCount; // Ensure it's a valid number
	// });

	const [smartContractBalance, setSmartContractBalance] =
		useState<number>(0.0); // Default to 0
	const [profitPerHour] = useState(15);
	const [publicAddress, setPublicAddress] = useState<string | null>(null);
	const [flowBalance, setFlowBalance] = useState(0);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const isTransactionInProgressRef = React.useRef(false); // Ref for transaction progress

	const { magic } = useMagic();

	// Persist localCount to localStorage whenever it changes
	// const setLocalCount: Dispatch<SetStateAction<number>> = (newCount) => {
	// 	console.log('Updating localCount:', newCount); // Debug log
	// 	setLocalCountState(newCount);
	// 	localStorage.setItem('localCount', newCount.toString());
	// };

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
			console.log('Fetched on-chain balance:', balance); // Debug log
			setSmartContractBalance(parseFloat(balance));
			return balance;
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
			const id = toast.loading('Initializing...');

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
				fcl.tx(transactionId).subscribe((res: any) => {
					toastStatus(id, res.status);

					console.log(res);

					if (res.status === 4) {
						// SEALED status
						console.log('Transaction sealed via subscribe.');
						toast.update(id, {
							render: 'Transaction Sealed',
							type: 'success',
							isLoading: false,
							autoClose: 5000,
						});
						// Delay resetting transaction progress
						setTimeout(() => {
							isTransactionInProgressRef.current = false;
						}, 2000);
					}
				});

				// Fetch updated balance
				// await fetchCoins(publicAddress);
			} catch (error) {
				console.error('Failed to send transaction:', error);
			}
		},
		[magic, publicAddress]
	);

	const [totalCount, setTotalCountState] = useState<number>(() => {
		const savedTotal = localStorage.getItem('totalCount');
		return savedTotal ? parseFloat(savedTotal) : 0.0; // Initialize from localStorage or 0
	});

	// Persist `totalCount` to localStorage
	const setTotalCount = (newCount: number) => {
		console.log('Updating totalCount:', newCount);
		setTotalCountState(newCount);
		localStorage.setItem('totalCount', newCount.toString());
	};

	// Sync with on-chain balance
	const saveOnchain = useCallback(async () => {
		console.log('Syncing with on-chain balance...');
		if (!publicAddress || isTransactionInProgressRef.current) return;

		try {
			// Fetch latest on-chain balance
			const onChainBalance = await fetchCoins(publicAddress);

			// Calculate unsynced coins
			const unsyncedCount = totalCount - onChainBalance;
			console.log('Unsynced Count:', unsyncedCount);

			if (unsyncedCount > 0) {
				console.log(`Sending ${unsyncedCount} coins to sync...`);
				const amountToSend = Math.min(unsyncedCount, 50); // Max per transaction
				await addCoins(amountToSend);

				// Update on-chain balance after transaction
				const updatedBalance = await fetchCoins(publicAddress);
				setSmartContractBalance(updatedBalance);
			}
		} catch (error) {
			console.error('Error in saveOnchain:', error);
		}
	}, [publicAddress, totalCount, fetchCoins, addCoins]);

	// Update total count on session increments
	const incrementTotalCount = (increment: number) => {
		const newCount = totalCount + increment;
		setTotalCount(newCount);
	};

	// Periodically sync with on-chain state
	useEffect(() => {
		const interval = setInterval(() => {
			if (!isTransactionInProgressRef.current) {
				saveOnchain();
			}
		}, 15000);
		return () => clearInterval(interval);
	}, [saveOnchain]);

	return (
		<AppContext.Provider
			value={{
				count: totalCount, // Use the updated `totalCount`
				setCount: incrementTotalCount, // Use the increment function for updating `totalCount`
				flowBalance,
				publicAddress,
				showLoginModal,
				setShowLoginModal,
				isTransactionInProgress: isTransactionInProgressRef.current,
				profitPerHour,
				coinBalance: smartContractBalance, // On-chain balance directly from smart contract
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
