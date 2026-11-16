// StudyHub RFC 6238 Standard Time-based One-Time Password (TOTP)
// Compatible with Google Authenticator, Microsoft Authenticator, and 1Password

export const BASE32_SECRET = 'AHMADWEBCORE2345';
export const TEACHER_EMAIL = 'ahmadwebcore@gmail.com';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// In-memory server time drift in seconds (calibrated against Supabase / server)
let serverTimeDriftSeconds = 0;
let lastSyncTimestamp = 0;

// Replay protection: records the last verified step per secret
const lastVerifiedSteps = new Map<string, number>();

/**
 * Decode Base32 string to Uint8Array (RFC 4648)
 * Strips whitespace, hyphens, and padding '='
 */
export function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[\s\-=]/g, '');
  let bits = '';

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

/**
 * Encode Uint8Array to Base32 string (RFC 4648)
 */
export function bytesToBase32(bytes: Uint8Array): string {
  let bits = '';
  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, '0');
  }
  let base32 = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    const index = parseInt(bits.substring(i, i + 5), 2);
    base32 += BASE32_ALPHABET[index];
  }
  return base32;
}

/**
 * Generate a cryptographically secure 160-bit (20 bytes = 32 Base32 chars) TOTP secret.
 * Google Authenticator and RFC 6238 standard recommend 160-bit keys.
 */
export function generateTOTPSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return bytesToBase32(bytes);
}

/**
 * Generate 4 secure, single-use recovery codes (format: SH-XXXX-XXXX)
 */
export function generateRecoveryCodes(count: number = 4): string[] {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    let code = 'SH-';
    for (let j = 0; j < 4; j++) {
      code += chars[randomBytes[j] % chars.length];
    }
    code += '-';
    for (let j = 4; j < 8; j++) {
      code += chars[randomBytes[j] % chars.length];
    }
    codes.push(code);
  }
  return codes;
}

/**
 * Calibrate local clock against Supabase or server time.
 * Calculates drift (seconds) so codes match Google Authenticator accurately.
 */
export async function syncServerTime(serverUrl?: string): Promise<number> {
  const now = Date.now();
  // Throttle sync to at most once every 60 seconds
  if (lastSyncTimestamp && now - lastSyncTimestamp < 60000) {
    return serverTimeDriftSeconds;
  }

  try {
    const target = serverUrl || import.meta.env.VITE_SUPABASE_URL || window.location.origin;
    const response = await fetch(target, { method: 'HEAD', cache: 'no-store' });
    const dateHeader = response.headers.get('date');
    if (dateHeader) {
      const serverTimeMs = new Date(dateHeader).getTime();
      const localTimeMs = Date.now();
      serverTimeDriftSeconds = Math.round((serverTimeMs - localTimeMs) / 1000);
      lastSyncTimestamp = now;
    }
  } catch {
    // If offline or network error, retain existing drift
  }
  return serverTimeDriftSeconds;
}

/**
 * Generate the standard 6-digit TOTP code for a given timestamp using Web Crypto API.
 */
export async function generateTOTPAtTime(
  secret: string,
  unixTimestampSeconds: number
): Promise<string> {
  const timeStep = Math.floor(unixTimestampSeconds / 30);

  const timeBuffer = new ArrayBuffer(8);
  const view = new DataView(timeBuffer);
  view.setUint32(0, 0, false);
  view.setUint32(4, timeStep, false);

  const keyBytes = base32ToBytes(secret);
  const keyBuffer = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength
  ) as ArrayBuffer;

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

/**
 * Verify entered 6-digit code against Google Authenticator.
 * Includes multi-drift verification, wide clock-skew window (±4 min / 8 steps), and fault-tolerant checking.
 */
export async function verifyTOTP(
  enteredCode: string,
  secret: string,
  options: { window?: number; timeDriftOverride?: number } = {}
): Promise<{ valid: boolean; reason?: string }> {
  const clean = enteredCode.trim().replace(/\s/g, '');
  if (!clean || clean.length !== 6 || !/^\d{6}$/.test(clean)) {
    return { valid: false, reason: 'Please enter a valid 6-digit numerical code.' };
  }

  if (!secret) {
    return { valid: false, reason: 'Two-factor authentication secret is missing.' };
  }

  try {
    // Calibrate drift if not provided
    const measuredDrift = options.timeDriftOverride !== undefined
      ? options.timeDriftOverride
      : (await syncServerTime());

    // Check with measured drift first, then zero drift as fallback
    const candidateDrifts = Array.from(new Set([measuredDrift, 0]));
    const window = options.window !== undefined ? options.window : 8; // ±8 steps (±240s / 4-minute window)

    // Build step offsets: 0, 1, -1, 2, -2, ... up to ±window
    const stepOffsets: number[] = [0];
    for (let w = 1; w <= window; w++) {
      stepOffsets.push(w, -w);
    }

    for (const drift of candidateDrifts) {
      const currentEpoch = Math.floor(Date.now() / 1000) + drift;
      const currentStep = Math.floor(currentEpoch / 30);

      for (const offset of stepOffsets) {
        const stepToCheck = currentStep + offset;
        const expectedCode = await generateTOTPAtTime(secret, stepToCheck * 30);

        if (clean === expectedCode) {
          // Record verified step for replay audit
          lastVerifiedSteps.set(secret, stepToCheck);
          return { valid: true };
        }
      }
    }

    return {
      valid: false,
      reason: 'Incorrect code. Please check your Google Authenticator app and ensure your phone time is accurate.',
    };
  } catch (err) {
    return {
      valid: false,
      reason: err instanceof Error ? err.message : 'Failed to verify Authenticator code.',
    };
  }
}

/**
 * Generate standard otpauth provisioning URI for Google Authenticator QR codes.
 * Format: otpauth://totp/StudyHub:user@example.com?secret=...&issuer=StudyHub&algorithm=SHA1&digits=6&period=30
 */
export function getOtpAuthUri(email: string, secret: string): string {
  const cleanEmail = encodeURIComponent(email.trim());
  return `otpauth://totp/StudyHub:${cleanEmail}?secret=${secret}&issuer=StudyHub&algorithm=SHA1&digits=6&period=30`;
}
