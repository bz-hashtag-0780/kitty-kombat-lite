'use client';

import { useState } from 'react';
import { useMagic } from '@/context/MagicContext';
import { useAuth } from '@/context/AuthContext';
import { saveToken } from '@/utils/common';
import { RPCError, RPCErrorCode } from 'magic-sdk';
import { Button } from '@/components/magic/ui/Button';
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

interface EmailLoginModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EmailLoginModal({ open, onOpenChange }: EmailLoginModalProps) {
	const { magic } = useMagic();
	const { token, setToken } = useAuth();
	const [email, setEmail] = useState('');
	const [isLoginInProgress, setLoginInProgress] = useState(false);
	const [emailError, setEmailError] = useState(false);

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const emailRegex =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

		if (!email.match(emailRegex)) {
			setEmailError(true);
			return;
		}
		setEmailError(false);

		try {
			setLoginInProgress(true);
			const token = await magic?.auth.loginWithEmailOTP({ email });
			if (token) {
				saveToken(token, setToken, 'EMAIL');
				toast('Login successful!', { type: 'success' });
				setEmail('');
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
						toast(e.message, { type: 'error' });
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
						Enter your email to receive a verification code.
					</DialogDescription>
				</DialogHeader>
				<DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogClose>

				<form onSubmit={handleEmailSubmit} className="space-y-4">
					<Input
						type="email"
						placeholder={
							token.length > 0
								? 'Already logged in'
								: 'example@gmail.com'
						}
						value={email}
						onChange={(e) => {
							if (emailError) setEmailError(false);
							setEmail(e.target.value);
						}}
						required
						className="text-black bg-white"
					/>
					{emailError && (
						<span className="self-start text-xs font-semibold text-red-700">
							Enter a valid email address
						</span>
					)}
					<Button
						type="submit"
						className="w-full bg-black text-white"
						disabled={isLoginInProgress || email.length === 0}
					>
						{isLoginInProgress ? <Spinner /> : 'Send Code'}
					</Button>
				</form>
				{token.length > 0 && <LogOutButton />}
			</DialogContent>
		</Dialog>
	);
}
