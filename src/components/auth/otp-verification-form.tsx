import * as React from 'react';
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

const schema = zod.object({
  otp: zod.string().min(1, { message: 'OTP is required' }).length(4, { message: 'OTP must be 4 digits' }),
});

type Values = zod.infer<typeof schema>;

interface OtpVerificationFormProps {
  phone: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function OtpVerificationForm({ phone, onCancel, onSuccess }: OtpVerificationFormProps): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: { otp: '' },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Values): Promise<void> => {
    try {
      setIsPending(true);
      await authService.verifyOtp(phone, values.otp);
      onSuccess();
    } catch (error) {
      setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Failed to verify OTP',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Verify OTP</Typography>
          <Typography color="text.secondary" variant="body2">
            Enter the 6-digit code sent to {phone}
          </Typography>
        </Stack>
        {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
        <Controller
          control={control}
          name="otp"
          render={({ field }) => (
            <FormControl error={Boolean(errors.otp)}>
              <InputLabel>OTP Code</InputLabel>
              <OutlinedInput {...field} label="OTP Code" type="text" inputProps={{ maxLength: 4 }} />
              {errors.otp ? <FormHelperText>{errors.otp.message}</FormHelperText> : null}
            </FormControl>
          )}
        />
        <Stack direction="row" spacing={2}>
          <Button color="inherit" disabled={isPending} fullWidth onClick={onCancel} size="large" variant="outlined">
            Cancel
          </Button>
          <Button disabled={isPending} fullWidth size="large" type="submit" variant="contained">
            Verify
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
