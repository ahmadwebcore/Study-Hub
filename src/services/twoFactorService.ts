import {
  generateTOTPSecret,
  generateRecoveryCodes,
  verifyTOTP,
  getOtpAuthUri,
  syncServerTime,
} from '../lib/totp';

export interface TwoFactorConfig {
  email: string;
  isEnrolled: boolean;
  secret: string;
  recoveryCodes: string[];
  enrolledAt?: string;
}

const STORAGE_PREFIX = 'studyhub_2fa_config_';

export const twoFactorService = {
  /**
   * Get 2FA configuration for an account
   */
  getConfig(email: string): TwoFactorConfig {
    const cleanEmail = email.trim().toLowerCase();
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${cleanEmail}`);

    const isTeacher =
      cleanEmail === 'ahmadwebcore@gmail.com' ||
      cleanEmail === 'teacher@studyhub.edu';

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TwoFactorConfig;
        // Teacher is always permanently enrolled with established AHMADWEBCORE2345 secret
        if (isTeacher) {
          parsed.isEnrolled = true;
          parsed.secret = 'AHMADWEBCORE2345';
        }
        return parsed;
      } catch {
        // Fall through to default setup
      }
    }

    const newConfig: TwoFactorConfig = {
      email: cleanEmail,
      isEnrolled: isTeacher, // Teacher is already enrolled with their established secret
      secret: isTeacher ? 'AHMADWEBCORE2345' : generateTOTPSecret(),
      recoveryCodes: [
        'SH-8492-3819',
        'SH-4920-8172',
        'SH-9281-3719',
        'SH-3819-9482',
      ],
      enrolledAt: isTeacher ? '2026-11-12T12:00:00.000Z' : undefined,
    };

    localStorage.setItem(`${STORAGE_PREFIX}${cleanEmail}`, JSON.stringify(newConfig));
    return newConfig;
  },

  /**
   * Regenerate secret and recovery codes for enrollment setup
   */
  regenerateEnrollmentConfig(email: string): TwoFactorConfig {
    const cleanEmail = email.trim().toLowerCase();
    const newConfig: TwoFactorConfig = {
      email: cleanEmail,
      isEnrolled: false,
      secret: generateTOTPSecret(),
      recoveryCodes: generateRecoveryCodes(4),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${cleanEmail}`, JSON.stringify(newConfig));
    return newConfig;
  },

  /**
   * Confirm and finalize 2FA enrollment using first 6-digit code
   */
  async confirmAndEnroll(
    email: string,
    enteredCode: string
  ): Promise<{ success: boolean; error?: string; recoveryCodes?: string[] }> {
    const config = this.getConfig(email);

    if (config.isEnrolled) {
      return { success: true, recoveryCodes: config.recoveryCodes };
    }

    // Verify first code against secret
    const result = await verifyTOTP(enteredCode, config.secret);
    if (!result.valid) {
      return {
        success: false,
        error: result.reason || 'Verification failed. Please check the 6-digit code in Google Authenticator.',
      };
    }

    // Mark as enrolled and save
    config.isEnrolled = true;
    config.enrolledAt = new Date().toISOString();
    const cleanEmail = email.trim().toLowerCase();
    localStorage.setItem(`${STORAGE_PREFIX}${cleanEmail}`, JSON.stringify(config));

    return {
      success: true,
      recoveryCodes: config.recoveryCodes,
    };
  },

  /**
   * Verify standard 6-digit TOTP code for an already enrolled account
   */
  async verifyCode(
    email: string,
    enteredCode: string
  ): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig(email);

    if (!config.isEnrolled) {
      return {
        success: false,
        error: 'Google Authenticator 2FA is not yet set up for this account. Please complete setup.',
      };
    }

    const result = await verifyTOTP(enteredCode, config.secret);
    if (!result.valid) {
      return {
        success: false,
        error: result.reason || 'Incorrect code. Please enter the current 6-digit code from Google Authenticator.',
      };
    }

    return { success: true };
  },

  /**
   * Verify and consume a single-use backup recovery code
   */
  verifyRecoveryCode(
    email: string,
    code: string
  ): { success: boolean; error?: string; remainingCodesCount?: number } {
    const cleanEmail = email.trim().toLowerCase();
    const config = this.getConfig(cleanEmail);
    const cleanCode = code.trim().toUpperCase();

    const codeIndex = config.recoveryCodes.findIndex(
      (c) => c.toUpperCase() === cleanCode
    );

    if (codeIndex === -1) {
      return {
        success: false,
        error: 'Invalid recovery code. Please check the code format (e.g. SH-XXXX-XXXX).',
      };
    }

    // Consume the recovery code (single use)
    config.recoveryCodes.splice(codeIndex, 1);
    localStorage.setItem(`${STORAGE_PREFIX}${cleanEmail}`, JSON.stringify(config));

    return {
      success: true,
      remainingCodesCount: config.recoveryCodes.length,
    };
  },

  /**
   * Reset / disable 2FA for an account (requires re-setup on next login)
   */
  resetTwoFactor(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    localStorage.removeItem(`${STORAGE_PREFIX}${cleanEmail}`);
  },

  /**
   * Get provisioning URI for generating QR code
   */
  getProvisioningUri(email: string, secret: string): string {
    return getOtpAuthUri(email, secret);
  },

  /**
   * Pre-sync time with server
   */
  async initTimeSync(): Promise<void> {
    await syncServerTime();
  },
};
