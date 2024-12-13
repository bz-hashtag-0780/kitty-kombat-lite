/* eslint-disable react-hooks/exhaustive-deps */
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
	coinBalance: number;
	failedTransactionCount: number;
	FAILURE_THRESHOLD: number;
	transferFlow: () => void;
	setWithdrawAmount: Dispatch<SetStateAction<string>>;
	setWithdrawAddress: Dispatch<SetStateAction<string>>;
	withdrawAmount: string;
	withdrawAddress: string;
	fetchUpgrades: () => Promise<any>;
	purchaseUpgrade: (upgradeName: string, price: number) => void;
	upgrades: any;
	playerUpgrades: any;
	claimPassiveCoins: () => void;
	lastClaimTimestamp: number;
	passiveEarnings: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const [totalCount, setTotalCountState] = useState<number>(0.0);
	const [smartContractBalance, setSmartContractBalance] =
		useState<number>(0.0);
	const [publicAddress, setPublicAddress] = useState<string | null>(null);
	const [flowBalance, setFlowBalance] = useState(0);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const isTransactionInProgressRef = React.useRef(false); // Ref for transaction progress
	const [failedTransactionCount, setFailedTransactionCount] = useState(0); // Track failed transactions
	const FAILURE_THRESHOLD = 4; // Set a threshold for prompting reconnect
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [withdrawAddress, setWithdrawAddress] = useState('');
	const [upgrades, setUpgrades] = useState<any>([]);
	const [playerUpgrades, setPlayerUpgrades] = useState<any>({});
	const [lastClaimTimestamp, setLastClaimTimestamp] = useState(0.0);
	const [passiveEarnings, setPassiveEarnings] = useState(0.0);

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
					if(account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath) == nil) {
				return 0.0
			}
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
		fetchUpgrades();

		if (publicAddress) {
			fetchFlowBalance(publicAddress);
			fetchPlayerUpgrades(publicAddress);
			fetchLastPassiveClaimTimestamp(publicAddress);
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
			const id = toast.loading('Saving progress...');

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
							render: 'Progress saved onchain!',
							type: 'success',
							isLoading: false,
							autoClose: 2000,
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
			} catch (error) {
				console.error('Failed to send transaction:', error);
				isTransactionInProgressRef.current = false;
				setFailedTransactionCount((prevFailedTransactionCount) => {
					const newCount = prevFailedTransactionCount + 1;
					console.log('Failed transaction count:', newCount);

					if (newCount >= FAILURE_THRESHOLD) {
						toast.update(id, {
							render: 'Multiple save failures. Please reconnect wallet.',
							type: 'error',
							isLoading: false,
							autoClose: 5000,
						});
					} else {
						toast.update(id, {
							render: 'Failed to save progress',
							type: 'error',
							isLoading: false,
							autoClose: 2000,
						});
					}

					return newCount; // Return the updated count
				});
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
				const amountToSend = Math.min(countDiff, 100); // Maximum per transaction
				await addCoins(amountToSend);
			}

			if (countDiff < 0) {
				console.warn('Local count is less than on-chain balance');
				// Update local count to match on-chain balance
				if (onChainBalance !== undefined) {
					persistTotalCount(onChainBalance);
				}
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

	const transferFlow = useCallback(async () => {
		if (
			!magic ||
			!publicAddress ||
			withdrawAddress === '' ||
			withdrawAmount === ''
		)
			return;

		const id = toast.loading('Starting transfer...');

		try {
			const transactionId = await fcl.mutate({
				cadence: `
                import FungibleToken from 0xf233dcee88fe0abe
				import FlowToken from 0x1654653399040a61

				transaction(amount: UFix64, to: Address) {

					// The Vault resource that holds the tokens that are being transferred
					let sentVault: @{FungibleToken.Vault}

					prepare(signer: auth(BorrowValue) &Account) {

						// Get a reference to the signer's stored FlowToken vault
						let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
							?? panic("The signer does not store a FlowToken.Vault object at the path /storage/flowTokenVault. The signer must initialize their account with this vault first!")

						// Withdraw tokens from the signer's stored vault
						self.sentVault <- vaultRef.withdraw(amount: amount)
					}

					execute {

						// Get the recipient's public account object
						let recipient = getAccount(to)

						// Get a reference to the recipient's Receiver
						let receiverRef = recipient.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
							?? panic("Could not borrow a Receiver reference to the FlowToken Vault in account "
								.concat(to.toString()).concat(" at path /public/flowTokenReceiver. Make sure you are sending to an address that has a FlowToken Vault set up properly at the specified path."))

						// Deposit the withdrawn tokens in the recipient's receiver
						receiverRef.deposit(from: <-self.sentVault)
					}
				}
              `,
				args: (arg: any, t: any) => [
					arg(withdrawAmount, t.UFix64),
					arg(withdrawAddress, t.Address),
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
						render: 'Flow successfully transferred!',
						type: 'success',
						isLoading: false,
						autoClose: 2000,
					});
					// Delay resetting transaction progress
					setTimeout(() => {
						// Update smart contract balance after transaction
						fetchFlowBalance(publicAddress);
					}, 2000);
				}
			});
		} catch (error) {
			console.error('Failed to send transaction:', error);
			setFailedTransactionCount((prevFailedTransactionCount) => {
				const newCount = prevFailedTransactionCount + 1;
				console.log('Failed transaction count:', newCount);

				if (newCount >= FAILURE_THRESHOLD) {
					toast.update(id, {
						render: 'Multiple transaction failures. Please reconnect wallet.',
						type: 'error',
						isLoading: false,
						autoClose: 5000,
					});
				} else {
					toast.update(id, {
						render: 'Failed to transfer flow',
						type: 'error',
						isLoading: false,
						autoClose: 2000,
					});
				}

				return newCount; // Return the updated count
			});
		}
	}, [magic, publicAddress, fetchFlowBalance]);

	const fetchUpgrades = useCallback(async () => {
		try {
			const response = await fcl.query({
				cadence: `
                import KittyKombatLite from 0x87535df35d7f64e1

				access(all) fun main(): {String: KittyKombatLite.Upgrade} {
					return KittyKombatLite.getAvailableUpgrades()
				}
            `,
			});
			console.log('Upgrades', response);
			// Format and sort the upgrades by price
			const formattedUpgrades = Object.entries(response)
				.map(([key, value]: [string, any]) => ({
					id: key,
					name: value.name,
					description: value.description,
					price: parseFloat(value.cost), // Ensure price is a number
					multiplier: value.multiplier,
				}))
				.sort((a, b) => a.price - b.price); // Sort by price (cheapest first)

			setUpgrades(formattedUpgrades);
			return response;
		} catch (error) {
			console.error('Failed to fetch upgrades:', error);
		}
	}, []);

	const fetchPlayerUpgrades = useCallback(async (address: string) => {
		try {
			const response = await fcl.query({
				cadence: `
					import KittyKombatLite from 0x87535df35d7f64e1
	
					access(all) fun main(address: Address): &{String: Int}? {
					let account = getAccount(address)
					if(account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath) == nil) {
						return nil
					}
					let player = account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath)
						?? panic("Could not borrow a reference to the player")
									
					return player.upgrades
				}
				`,
				args: (arg: any, t: any) => [arg(address, t.Address)],
			});
			setPlayerUpgrades(response || {});
			const fetchedUpgrades = await fetchUpgrades();
			const earnings = calculatePassiveEarnings(
				response,
				fetchedUpgrades
			);
			setPassiveEarnings(earnings);
			return response || {}; // Ensure we return a valid empty object if `nil`
		} catch (error) {
			console.error('Failed to fetch player upgrades:', error);
			return {}; // Return an empty map on failure
		}
	}, []);

	const purchaseUpgrade = useCallback(
		async (upgradeName: string, price: number) => {
			if (!magic || !publicAddress) return;

			if (isTransactionInProgressRef.current) {
				console.warn('Transaction already in progress');

				return;
			}

			isTransactionInProgressRef.current = true;
			const id = toast.loading('Purchasing upgrade...');

			try {
				const transactionId = await fcl.mutate({
					cadence: `
                import KittyKombatLite from 0x87535df35d7f64e1

                transaction(upgradeName: String) {
				prepare(acct: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
					if acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) == nil {
						acct.storage.save(<- KittyKombatLite.createPlayer(), to: KittyKombatLite.PlayerStoragePath)
						let playerCap = acct.capabilities.storage.issue<&KittyKombatLite.Player>(KittyKombatLite.PlayerStoragePath)
						acct.capabilities.publish(playerCap, at: KittyKombatLite.PlayerPublicPath)
					}

					let playerRef = acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) ?? panic("Could not borrow a reference to the player")
					
					playerRef.purchaseUpgrade(upgradeName: upgradeName)
				}

				execute {}
			}
              `,
					args: (arg: any, t: any) => [arg(upgradeName, t.String)],
					proposer: magic.flow.authorization,
					authorizations: [magic.flow.authorization],
					payer: magic.flow.authorization,
					limit: 9999,
				});
				console.log('smart balance:', smartContractBalance);
				console.log('price:', price);
				console.log('new balance:', smartContractBalance - price);
				console.log('total count:', totalCount);
				const newTotal = smartContractBalance - price;
				console.log('new total:', newTotal);
				// Deduct the price from total count

				console.log('Transaction submitted with ID:', transactionId);
				fcl.tx(transactionId).subscribe((res: any) => {
					toastStatus(id, res.status);

					console.log(res);

					if (res.status === 4) {
						// SEALED status
						console.log('Transaction sealed via subscribe.');
						toast.update(id, {
							render: 'Upgrade purchased!',
							type: 'success',
							isLoading: false,
							autoClose: 2000,
						});
						// Delay resetting transaction progress
						setTimeout(() => {
							// Update smart contract balance after transaction
							fetchCoins(publicAddress).then(
								(updatedBalance: any) => {
									setSmartContractBalance(updatedBalance);
									persistTotalCount(updatedBalance);
									isTransactionInProgressRef.current = false;
								}
							);
							fetchPlayerUpgrades(publicAddress);
						}, 2000);
					}
				});
			} catch (error) {
				console.error('Failed to send transaction:', error);
				isTransactionInProgressRef.current = false;
				setFailedTransactionCount((prevFailedTransactionCount) => {
					const newCount = prevFailedTransactionCount + 1;
					console.log('Failed transaction count:', newCount);

					if (newCount >= FAILURE_THRESHOLD) {
						toast.update(id, {
							render: 'Multiple transaction failures. Please reconnect wallet.',
							type: 'error',
							isLoading: false,
							autoClose: 5000,
						});
					} else {
						toast.update(id, {
							render: 'Failed to purchase upgrade',
							type: 'error',
							isLoading: false,
							autoClose: 2000,
						});
					}

					return newCount; // Return the updated count
				});
			}
		},
		[magic, publicAddress, fetchCoins]
	);

	const fetchLastPassiveClaimTimestamp = useCallback(
		async (address: string) => {
			try {
				const response = await fcl.query({
					cadence: `
					import KittyKombatLite from 0x87535df35d7f64e1
	
					access(all) fun main(address: Address): UFix64 {
						let account = getAccount(address)
						if(account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath) == nil) {
							return 0.0
						}
						let player = account.capabilities.borrow<&KittyKombatLite.Player>(KittyKombatLite.PlayerPublicPath)
							?? panic("Could not borrow a reference to the player")
										
						return player.lastPassiveClaim
					}
					
				`,
					args: (arg: any, t: any) => [arg(address, t.Address)],
				});
				setLastClaimTimestamp(response);
				console.log('Fetched last passive claim timestamp:', response);
				return response;
			} catch (error) {
				console.error(
					'Failed to fetch player last passive claim timestamp:',
					error
				);
			}
		},
		[]
	);

	const calculatePassiveEarnings = (
		playerUpgrades: { [key: string]: number }, // Player's upgrades (e.g., { "Speed Booster": 1, "Mega Tapper": 0 })
		availableUpgrades: { [key: string]: { multiplier: number } } // Available upgrades with multipliers
	): number => {
		const baseEarnings = 10.0; // Base earnings per claim
		let totalMultiplier = 1.0;

		for (const [upgradeName, level] of Object.entries(playerUpgrades)) {
			if (availableUpgrades[upgradeName]) {
				const upgradeMultiplier =
					availableUpgrades[upgradeName].multiplier;
				totalMultiplier += level * (upgradeMultiplier - 1.0);
			}
		}

		return baseEarnings * totalMultiplier;
	};

	const claimPassiveCoins = useCallback(async () => {
		if (!magic || !publicAddress) return;

		if (isTransactionInProgressRef.current) {
			console.warn('Transaction already in progress');

			return;
		}

		isTransactionInProgressRef.current = true;
		const id = toast.loading('Claiming coins...');

		try {
			const transactionId = await fcl.mutate({
				cadence: `
                import KittyKombatLite from 0x87535df35d7f64e1

                transaction() {
					prepare(acct: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
						if acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) == nil {
							acct.storage.save(<- KittyKombatLite.createPlayer(), to: KittyKombatLite.PlayerStoragePath)
							let playerCap = acct.capabilities.storage.issue<&KittyKombatLite.Player>(KittyKombatLite.PlayerStoragePath)
							acct.capabilities.publish(playerCap, at: KittyKombatLite.PlayerPublicPath)
						}

						let playerRef = acct.storage.borrow<&KittyKombatLite.Player>(from: KittyKombatLite.PlayerStoragePath) ?? panic("Could not borrow a reference to the player")
						
						playerRef.claimPassiveCoins()
					}

					execute {}
				}
              `,
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
						render: 'Coins claimed!',
						type: 'success',
						isLoading: false,
						autoClose: 2000,
					});
					// Delay resetting transaction progress
					setTimeout(() => {
						// Update smart contract balance after transaction
						fetchCoins(publicAddress).then(
							(updatedBalance: any) => {
								setSmartContractBalance(updatedBalance);
								persistTotalCount(updatedBalance);
								fetchLastPassiveClaimTimestamp(publicAddress);
								isTransactionInProgressRef.current = false;
							}
						);
						fetchPlayerUpgrades(publicAddress);
					}, 2000);
				}
			});
		} catch (error) {
			console.error('Failed to send transaction:', error);
			isTransactionInProgressRef.current = false;
			setFailedTransactionCount((prevFailedTransactionCount) => {
				const newCount = prevFailedTransactionCount + 1;
				console.log('Failed transaction count:', newCount);

				if (newCount >= FAILURE_THRESHOLD) {
					toast.update(id, {
						render: 'Multiple save failures. Please reconnect wallet.',
						type: 'error',
						isLoading: false,
						autoClose: 5000,
					});
				} else {
					toast.update(id, {
						render: 'Failed to claim coins.',
						type: 'error',
						isLoading: false,
						autoClose: 2000,
					});
				}

				return newCount; // Return the updated count
			});
		}
	}, [magic, publicAddress, fetchCoins]);

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
				coinBalance: smartContractBalance,
				failedTransactionCount,
				FAILURE_THRESHOLD,
				transferFlow,
				setWithdrawAmount,
				setWithdrawAddress,
				withdrawAmount,
				withdrawAddress,
				fetchUpgrades,
				purchaseUpgrade,
				upgrades,
				playerUpgrades,
				claimPassiveCoins,
				lastClaimTimestamp,
				passiveEarnings,
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
