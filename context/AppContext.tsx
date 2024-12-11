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
	// const [localCount, setLocalCountState] = useState<number>(() => {
	// 	const savedCount = localStorage.getItem('localCount');
	// 	const parsedCount = parseFloat(savedCount || '0'); // Fallback to 0 if invalid
	// 	return isNaN(parsedCount) ? 0.0 : parsedCount; // Ensure it's a valid number
	// });
	const [totalCount, setTotalCountState] = useState<number>(0.0);
	const [smartContractBalance, setSmartContractBalance] =
		useState<number>(0.0);
	const [profitPerHour] = useState(15);
	const [publicAddress, setPublicAddress] = useState<string | null>(null);
	const [flowBalance, setFlowBalance] = useState(0);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const isTransactionInProgressRef = React.useRef(false); // Ref for transaction progress

	const { magic } = useMagic();

	const persistTotalCount = (newCount: number) => {
		setTotalCountState(newCount);
		localStorage.setItem('totalCount', newCount.toString());
	};

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
			const parsedBalance = parseFloat(balance);
			setSmartContractBalance(parsedBalance);
			return parsedBalance;
		} catch (error) {
			console.error('Failed to fetch Coin balance:', error);
		}
	}, []);

	useEffect(() => {
		if (publicAddress) {
			(async () => {
				// Load saved `totalCount` from localStorage
				const savedTotal = localStorage.getItem('totalCount');
				const onChainBalance = await fetchCoins(publicAddress);

				if (onChainBalance !== undefined) {
					if (savedTotal) {
						const parsedSavedTotal = parseFloat(savedTotal);

						// Validate saved `totalCount` against on-chain balance
						if (parsedSavedTotal < onChainBalance) {
							// If saved total is less, use the on-chain balance
							console.warn(
								`Local totalCount (${parsedSavedTotal}) is less than on-chain balance (${onChainBalance}). Resetting to on-chain balance.`
							);
							persistTotalCount(onChainBalance);
						} else {
							// If valid, use the saved total
							setTotalCountState(parsedSavedTotal);
						}
					} else {
						// No saved total, initialize with on-chain balance
						persistTotalCount(onChainBalance);
					}
				}
			})();
		}
	}, [publicAddress, fetchCoins]);

	const addCoins = useCallback(
		async (countDiff: number) => {
			if (!magic || !publicAddress || countDiff <= 0) return;

			if (isTransactionInProgressRef.current) {
				console.warn('Transaction already in progress');

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
							// Update smart contract balance after transaction
							fetchCoins(publicAddress).then(
								(updatedBalance: any) => {
									setSmartContractBalance(updatedBalance);
									isTransactionInProgressRef.current = false;
								}
							);
						}, 2000);
					}
				});

				// Fetch updated balance
				// await fetchCoins(publicAddress);
			} catch (error) {
				console.error('Failed to send transaction:', error);
			}
		},
		[magic, publicAddress, fetchCoins]
	);

	const saveOnchain = useCallback(async () => {
		console.log('Syncing with on-chain balance...');

		if (!publicAddress || isTransactionInProgressRef.current) {
			console.log(
				'Skipping sync: either no publicAddress or transaction in progress'
			);
			return;
		}

		try {
			// Fetch on-chain balance
			const onChainBalance = await fetchCoins(publicAddress);

			// Calculate the difference between local and on-chain balance
			const countDiff =
				onChainBalance !== undefined ? totalCount - onChainBalance : 0; // Difference to be synchronized
			console.log('total count:', totalCount);
			console.log('On-chain count:', onChainBalance);
			console.log('Count difference (to save):', countDiff);

			// Perform transaction if there's a difference
			if (countDiff > 0) {
				console.log('Sending coins to on-chain balance...');
				const amountToSend = Math.min(countDiff, 50); // Maximum per transaction
				await addCoins(amountToSend);
			}
		} catch (error) {
			console.error('Error in saveOnchain:', error);
		}
	}, [publicAddress, totalCount, addCoins, fetchCoins]);

	const incrementTotalCount = (increment: number) => {
		const newTotal = totalCount + increment;
		persistTotalCount(newTotal); // Update and persist
	};

	useEffect(() => {
		if (totalCount >= smartContractBalance + 10) {
			saveOnchain();
		}
		const interval = setInterval(() => {
			if (!isTransactionInProgressRef.current) {
				saveOnchain();
			}
		}, 8000);

		return () => clearInterval(interval);
	}, [saveOnchain, totalCount, smartContractBalance]);

	return (
		<AppContext.Provider
			value={{
				count: totalCount, // Unified total count
				setCount: incrementTotalCount, // Increment total count
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
