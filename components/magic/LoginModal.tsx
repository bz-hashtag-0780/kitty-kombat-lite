'use client';

import { useState } from 'react';
import { useMagic } from '@/context/MagicContext';
import { useAuth } from '@/context/AuthContext';
import { saveToken } from '@/utils/common';
import { RPCError, RPCErrorCode } from 'magic-sdk';
import { LoginModalButton } from '@/components/magic/ui/LoginModalButton';
import { X } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from '@/components/magic/ui/Dialog';
import { Input } from '@/components/magic/ui/Input';
import Spinner from '@/components/magic/ui/Spinner';
import { toast } from 'react-toastify';
import { LogOutButton } from './LogOutButton';

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
		const formattedPhoneNumber = phoneNumber.startsWith('+')
			? phoneNumber
			: '+' + phoneNumber;
		if (!formattedPhoneNumber.match(/^\+?\d{10,14}$/)) {
			setPhoneError(true);
			return;
		}
		setPhoneError(false);

		try {
			setLoginInProgress(true);
			const token = await magic?.auth.loginWithSMS({
				phoneNumber: formattedPhoneNumber,
			});
			if (token) {
				saveToken(token, setToken, 'SMS');
				toast('Login successful!', { type: 'success' });
				setPhoneNumber('');
				onOpenChange(false);
				window.location.reload(); // Refresh the page
			}
		} catch (e) {
			console.error('Login error:', e);
			if (e instanceof RPCError) {
				switch (e.code) {
					case RPCErrorCode.MagicLinkFailedVerification:
					case RPCErrorCode.MagicLinkExpired:
					case RPCErrorCode.MagicLinkRateLimited:
					case RPCErrorCode.UserAlreadyLoggedIn:
						toast(e.message, {
							type: 'error',
						});
						break;
					default:
						toast('Something went wrong. Please try again.', {
							type: 'error',
						});
				}
			} else {
				toast('Unexpected error. Please try again.', { type: 'error' });
			}
		} finally {
			setLoginInProgress(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md text-black bg-white">
				<DialogHeader>
					<DialogTitle>Login to Save Progress</DialogTitle>
					<DialogDescription>
						Enter your phone number to receive a login link via SMS.
					</DialogDescription>
				</DialogHeader>
				<DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogClose>

				<form onSubmit={handlePhoneSubmit} className="space-y-4">
					<Input
						type="tel"
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
						className="text-black bg-white"
					/>
					{phoneError && (
						<span className="self-start text-xs font-semibold text-red-700">
							Enter a valid phone number
						</span>
					)}
					<LoginModalButton
						type="submit"
						className="w-full"
						disabled={isLoginInProgress || phoneNumber.length === 0}
					>
						{isLoginInProgress ? <Spinner /> : 'Send Code'}
					</LoginModalButton>
				</form>
				{token.length > 0 && <LogOutButton />}
			</DialogContent>
		</Dialog>
	);
}
