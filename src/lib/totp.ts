// StudyHub RFC 6238 Standard Time-based One-Time Password (TOTP)
// Compatible with Google Authenticator, Microsoft Authenticator, and 1Password

export const BASE32_SECRET = 'AHMADWEBCORE2345';
export const TEACHER_EMAIL = 'ahmadwebcore@gmail.com';

// Convert Base32 string to Uint8Array
export function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = base32.toUpperCase().replace(/[\s-]/g, '');
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

// Generate the exact 6-digit TOTP code for the current 30-second window
export async function generateTOTP(
  secret: string = BASE32_SECRET,
  offsetSeconds: number = 0
): Promise<string> {
  const epoch = Math.floor(Date.now() / 1000) + offsetSeconds;
  const timeStep = Math.floor(epoch / 30);

  const timeBuffer = new ArrayBuffer(8);
  const view = new DataView(timeBuffer);
  view.setUint32(0, 0, false);
  view.setUint32(4, timeStep, false);

  const keyBytes = base32ToBytes(secret);
  const keyBuffer = keyBytes.buffer as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, timeBuffer);
  const hash = new Uint8Array(signature);
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// Strictly verify entered 6-digit code against Google Authenticator
export async function verifyTOTP(
  enteredCode: string,
  secret: string = BASE32_SECRET
): Promise<{ valid: boolean; reason?: string }> {
  const clean = enteredCode.trim().replace(/\s/g, '');
  if (!clean || clean.length !== 6 || !/^\d{6}$/.test(clean)) {
    return { valid: false, reason: 'Please enter a 6-digit code.' };
  }

  try {
    const currentCode = await generateTOTP(secret, 0);
    const prevCode = await generateTOTP(secret, -30);
    const nextCode = await generateTOTP(secret, 30);

    if (clean === currentCode || clean === prevCode || clean === nextCode) {
      return { valid: true };
    }

    return {
      valid: false,
      reason: 'Incorrect code. Please enter the current 6-digit code from Google Authenticator.',
    };
  } catch {
    return { valid: false, reason: 'Failed to verify Authenticator code.' };
  }
}

// Generate the standard scannable otpauth URI for Google Authenticator
export function getOtpAuthUri(email: string = TEACHER_EMAIL, secret: string = BASE32_SECRET): string {
  const cleanEmail = encodeURIComponent(email);
  return `otpauth://totp/StudyHub:${cleanEmail}?secret=${secret}&issuer=StudyHub&algorithm=SHA1&digits=6&period=30`;
}
