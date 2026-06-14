import { neon } from './client';

// Re-exported so callers don't reach through `neon`.
export const auth = neon.auth;

// Success, or a human-readable message for the auth forms.
export interface AuthOutcome {
	ok: boolean;
	error: string | null;
}

const messageFor = (error: { message?: string } | null | undefined): string =>
	error?.message ?? 'Something went wrong. Please try again.';

export const signUpEmail = async (
	name: string,
	email: string,
	password: string,
): Promise<AuthOutcome> => {
	const { error } = await auth.signUp.email({ name, email, password });
	return { ok: error == null, error: error == null ? null : messageFor(error) };
};

export const signInEmail = async (
	email: string,
	password: string,
): Promise<AuthOutcome> => {
	const { error } = await auth.signIn.email({ email, password });
	return { ok: error == null, error: error == null ? null : messageFor(error) };
};

export const signOut = async (): Promise<void> => {
	await auth.signOut();
};

// Email verification by one-time code (Neon Auth "codes" method).
export const sendVerificationCode = async (
	email: string,
): Promise<AuthOutcome> => {
	const { error } = await auth.emailOtp.sendVerificationOtp({
		email,
		type: 'email-verification',
	});
	return { ok: error == null, error: error == null ? null : messageFor(error) };
};

export const verifyEmailCode = async (
	email: string,
	otp: string,
): Promise<AuthOutcome> => {
	const { error } = await auth.emailOtp.verifyEmail({ email, otp });
	return { ok: error == null, error: error == null ? null : messageFor(error) };
};
