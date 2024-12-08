'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

interface LoginModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
	const [phoneNumber, setPhoneNumber] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [step, setStep] = useState<'phone' | 'code'>('phone');

	const handlePhoneSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// Here you would typically send the phone number to your backend
		// and trigger SMS verification
		console.log('Phone number submitted:', phoneNumber);
		setStep('code');
	};

	const handleCodeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			// Simulating login process
			console.log('Verification code submitted:', verificationCode);
			// await login(phoneNumber, verificationCode)
			onOpenChange(false);
			setStep('phone');
			setPhoneNumber('');
			setVerificationCode('');
		} catch (error) {
			console.error('Login failed:', error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Login to Save Progress</DialogTitle>
					<DialogDescription>
						{step === 'phone'
							? 'Enter your phone number to receive a verification code.'
							: 'Enter the verification code sent to your phone.'}
					</DialogDescription>
				</DialogHeader>
				<DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogClose>

				{step === 'phone' ? (
					<form onSubmit={handlePhoneSubmit} className="space-y-4">
						<Input
							type="tel"
							placeholder="Enter phone number"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							required
						/>
						<Button type="submit" className="w-full">
							Send Code
						</Button>
					</form>
				) : (
					<form onSubmit={handleCodeSubmit} className="space-y-4">
						<Input
							type="text"
							placeholder="Enter verification code"
							value={verificationCode}
							onChange={(e) =>
								setVerificationCode(e.target.value)
							}
							required
						/>
						<Button type="submit" className="w-full">
							Verify
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
