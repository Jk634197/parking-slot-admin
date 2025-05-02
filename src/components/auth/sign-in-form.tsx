'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authService } from '@/lib/auth-service';
import { useUser } from '@/hooks/use-user';

import { OtpVerificationForm } from './otp-verification-form';

const schema = zod.object({
  phone: zod
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .regex(/^\d+$/, { message: 'Phone number must contain only digits' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { phone: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [phone, setPhone] = useState('');

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = async (values: Values): Promise<void> => {
    try {
      setIsPending(true);
      await authService.signIn(values);
      setPhone(values.phone);
      setShowOtpForm(true);
    } catch (error) {
      setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Failed to sign in',
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleOtpSuccess = async (): Promise<void> => {
    // Refresh the auth state
    await checkSession?.();
    // UserProvider will handle the router refresh and GuestGuard will handle the redirect
    router.refresh();
  };

  if (showOtpForm) {
    return (
      <OtpVerificationForm
        phone={phone}
        onCancel={() => {
          setShowOtpForm(false);
        }}
        onSuccess={handleOtpSuccess}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Sign in</Typography>
          <Typography color="text.secondary" variant="body2">
            Enter your phone number to continue
          </Typography>
        </Stack>
        {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <FormControl error={Boolean(errors.phone)}>
              <InputLabel>Phone Number</InputLabel>
              <OutlinedInput {...field} label="Phone Number" type="tel" inputProps={{ maxLength: 15 }} />
              {errors.phone ? <FormHelperText>{errors.phone.message}</FormHelperText> : null}
            </FormControl>
          )}
        />
        <Button disabled={isPending} fullWidth size="large" type="submit" variant="contained">
          Continue
        </Button>
        {/* <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            Don&apos;t have an account?
          </Typography>
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Stack> */}
      </Stack>
    </form>
  );
}
