'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable indent */
/* eslint-disable quotes */
import React, { useCallback, useEffect, useState } from 'react';
import { useMagic } from '@/context/MagicContext';
import FormInput from '@/components/magic/ui/FormInput';
import Card from '@/components/magic/ui/Card';
import CardHeader from '@/components/magic/ui/CardHeader';
import Spinner from '@/components/magic/ui/Spinner';
import * as fcl from '@onflow/fcl';

const SendTransaction = () => {
	const { magic } = useMagic();
	const [toAddress, setToAddress] = useState('');
	const [amount, setAmount] = useState('');
	const [disabled, setDisabled] = useState(!toAddress || !amount);
	const [toAddressError, setToAddressError] = useState(false);
	const [amountError, setAmountError] = useState(false);
	const [transactionLoading, setTransactionLoading] = useState(false);
	const publicAddress =
		typeof window !== 'undefined' ? localStorage.getItem('user') : null;

	useEffect(() => {
		setDisabled(!toAddress || !amount);
		setAmountError(false);
		setToAddressError(false);
	}, [amount, toAddress]);

	const sendTransaction = useCallback(async () => {
		if (!magic) {
			return;
		}
		try {
			setTransactionLoading(true);

			const response = await fcl.mutate({
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
					arg(Number(amount).toFixed(2), t.UFix64),
					arg(toAddress, t.Address),
				],
				proposer: magic.flow.authorization,
				authorizations: [magic.flow.authorization],
				payer: magic.flow.authorization,
				limit: 999,
			});
			console.log('response: ', JSON.stringify(response));

			console.log('Waiting for transaction to be sealed');
			const data = await fcl.tx(response).onceSealed();
			console.log('sealed: ', JSON.stringify(data));

			if (data.status === 4 && data.statusCode === 0) {
				alert('Transaction successful');
			} else {
				alert('Transaction Failed! Check console for more details');
				console.log('transaction error: ' + data.errorMessage);
			}
			setTransactionLoading(false);
			setToAddress('');
			setAmount('');
		} catch (e) {
			setTransactionLoading(false);
			alert('Transaction Failed! Check console for more details');
			console.log(e);
		}
	}, [magic, amount, publicAddress, toAddress]);

	return (
		<Card>
			<CardHeader id="send-transaction">Send Transaction</CardHeader>

			<FormInput
				value={toAddress}
				onChange={(e: any) => setToAddress(e.target.value)}
				placeholder="Receiving Address"
			/>
			{toAddressError ? <p>Invalid address</p> : null}
			<FormInput
				value={amount}
				onChange={(e: any) => setAmount(e.target.value)}
				placeholder={`Amount (FLOW)`}
			/>
			{amountError ? <p className="error">Invalid amount</p> : null}
			<button
				onClick={sendTransaction}
				disabled={!toAddress || !amount || disabled}
			>
				{transactionLoading ? (
					<div className="w-full loading-container">
						<Spinner />
					</div>
				) : (
					'Send Transaction'
				)}
			</button>
		</Card>
	);
};

export default SendTransaction;
