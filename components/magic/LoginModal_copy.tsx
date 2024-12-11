'use client';

import { useState } from 'react';
import { useMagic } from '@/context/MagicContext';
import { useAuth } from '@/context/AuthContext';
import showToast from '@/utils/showToast';
import { saveToken } from '@/utils/common';
import { RPCError, RPCErrorCode } from 'magic-sdk';
// import { LoginModalButton } from '@/components/magic/ui/LoginModalButton';
// import { X } from 'lucide-react';
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogClose,
// } from '@/components/magic/ui/Dialog';
// import { Input } from '@/components/magic/ui/Input';
// import Spinner from '@/components/magic/ui/Spinner';

interface LoginModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
	const { magic } = useMagic();
	const { token, setToken } = useAuth();
	const [phoneNumber, setPhoneNumber] = useState('');
	const [isLoginInProgress, setLoginInProgress] = useState(false);
	const [phoneError, setPhoneError] = useState(false);

	const handlePhoneSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!phoneNumber.match(/^\+?\d{10,14}$/)) {
			setPhoneError(true);
			return;
		}
		setPhoneError(false);

		try {
			setLoginInProgress(true);
			const token = await magic?.auth.loginWithSMS({ phoneNumber });
			if (token) {
				saveToken(token, setToken, 'SMS');
				showToast({ message: 'Login successful!', type: 'success' });
				setPhoneNumber('');
				onOpenChange(false);
			}
		} catch (e) {
			console.error('Login error:', e);
			if (e instanceof RPCError) {
				switch (e.code) {
					case RPCErrorCode.MagicLinkFailedVerification:
					case RPCErrorCode.MagicLinkExpired:
					case RPCErrorCode.MagicLinkRateLimited:
					case RPCErrorCode.UserAlreadyLoggedIn:
						showToast({ message: e.message, type: 'error' });
						break;
					default:
						showToast({
							message: 'Something went wrong. Please try again.',
							type: 'error',
						});
				}
				alert('something went wrong 1');
			} else {
				showToast({
					message: 'Unexpected error. Please try again.',
					type: 'error',
				});
				alert('something went wrong 2');
			}
		} finally {
			setLoginInProgress(false);
			alert('something went wrong 3');
		}
	};

	return (
		<>
			{open && (
				<div className="login-container">
					<h2>Login to Save Progress</h2>
					<p>
						Enter your phone number to receive a login link via SMS.
					</p>
					<form onSubmit={handlePhoneSubmit}>
						<input
							type="tel"
							className="text-black"
							placeholder={
								token.length > 0
									? 'Already logged in'
									: '+11234567890'
							}
							value={phoneNumber}
							onChange={(e) => {
								if (phoneError) setPhoneError(false);
								setPhoneNumber(e.target.value);
							}}
							required
						/>
						{phoneError && <span>Enter a valid phone number</span>}
						<button
							type="submit"
							disabled={
								isLoginInProgress || phoneNumber.length === 0
							}
						>
							{isLoginInProgress ? 'Loading...' : 'Send Code'}
						</button>
					</form>
				</div>
			)}
		</>
	);
}
