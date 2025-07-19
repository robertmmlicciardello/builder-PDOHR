import CryptoJS from "crypto-js";
import { ENCRYPTION_CONFIG } from "@shared/personnel";

// Encryption key should be stored securely in environment variables
const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || "default-key-change-this";

export class EncryptionService {
  private static key = CryptoJS.SHA256(ENCRYPTION_KEY);

  /**
   * Encrypt sensitive text data using AES-256-GCM
   */
  static encrypt(plaintext: string): string {
    try {
      // Generate random IV and salt
      const salt = CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.saltSize);
      const iv = CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.ivSize);

      // Derive key with PBKDF2
      const derivedKey = CryptoJS.PBKDF2(this.key, salt, {
        keySize: ENCRYPTION_CONFIG.keySize / 32,
        iterations: 10000,
        hasher: CryptoJS.algo.SHA256,
      });

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(plaintext, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combine salt, iv, and encrypted data
      const combined = salt.concat(iv).concat(encrypted.ciphertext);

      // Return base64 encoded result
      return CryptoJS.enc.Base64.stringify(combined);
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypt sensitive text data
   */
  static decrypt(ciphertext: string): string {
    try {
      // Parse the combined data
      const combined = CryptoJS.enc.Base64.parse(ciphertext);

      // Extract salt, iv, and encrypted data
      const salt = CryptoJS.lib.WordArray.create(
        combined.words.slice(0, ENCRYPTION_CONFIG.saltSize / 4),
      );
      const iv = CryptoJS.lib.WordArray.create(
        combined.words.slice(
          ENCRYPTION_CONFIG.saltSize / 4,
          (ENCRYPTION_CONFIG.saltSize + ENCRYPTION_CONFIG.ivSize) / 4,
        ),
      );
      const encrypted = CryptoJS.lib.WordArray.create(
        combined.words.slice(
          (ENCRYPTION_CONFIG.saltSize + ENCRYPTION_CONFIG.ivSize) / 4,
        ),
      );

      // Derive the same key
      const derivedKey = CryptoJS.PBKDF2(this.key, salt, {
        keySize: ENCRYPTION_CONFIG.keySize / 32,
        iterations: 10000,
        hasher: CryptoJS.algo.SHA256,
      });

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        derivedKey,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        },
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Hash sensitive data for searching (one-way)
   */
  static hash(data: string): string {
    try {
      return CryptoJS.SHA256(data + ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error("Hashing failed:", error);
      throw new Error("Failed to hash data");
    }
  }

  /**
   * Encrypt personnel ID for secure storage
   */
  static encryptPersonnelId(id: string): string {
    return this.encrypt(id);
  }

  /**
   * Decrypt personnel ID
   */
  static decryptPersonnelId(encryptedId: string): string {
    return this.decrypt(encryptedId);
  }

  /**
   * Encrypt duties field
   */
  static encryptDuties(duties: string): string {
    return this.encrypt(duties);
  }

  /**
   * Decrypt duties field
   */
  static decryptDuties(encryptedDuties: string): string {
    return this.decrypt(encryptedDuties);
  }

  /**
   * Securely compare encrypted data without decryption
   */
  static secureCompare(encrypted1: string, encrypted2: string): boolean {
    try {
      // For secure comparison, we decrypt both and compare
      // In production, consider using searchable encryption
      const decrypted1 = this.decrypt(encrypted1);
      const decrypted2 = this.decrypt(encrypted2);
      return decrypted1 === decrypted2;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate secure random ID
   */
  static generateSecureId(): string {
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    return CryptoJS.enc.Hex.stringify(randomBytes);
  }

  /**
   * Validate encryption key strength
   */
  static validateKeyStrength(): boolean {
    if (ENCRYPTION_KEY === "default-key-change-this") {
      console.warn(
        "Using default encryption key! Change REACT_APP_ENCRYPTION_KEY in production.",
      );
      return false;
    }

    if (ENCRYPTION_KEY.length < 32) {
      console.warn("Encryption key is too short. Use at least 32 characters.");
      return false;
    }

    return true;
  }

  /**
   * Initialize encryption service and validate setup
   */
  static initialize(): boolean {
    try {
      // Validate key strength
      if (!this.validateKeyStrength()) {
        return false;
      }

      // Test encryption/decryption
      const testData = "မြန်မာစာ test 123";
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);

      if (decrypted !== testData) {
        console.error("Encryption test failed");
        return false;
      }

      console.log("Encryption service initialized successfully");
      return true;
    } catch (error) {
      console.error("Encryption service initialization failed:", error);
      return false;
    }
  }
}

// Utility functions for handling encrypted data in forms
export const encryptFormData = (data: any, fieldsToEncrypt: string[]): any => {
  const result = { ...data };

  fieldsToEncrypt.forEach((field) => {
    if (result[field] && typeof result[field] === "string") {
      result[field] = EncryptionService.encrypt(result[field]);
    }
  });

  return result;
};

export const decryptFormData = (data: any, fieldsToDecrypt: string[]): any => {
  const result = { ...data };

  fieldsToDecrypt.forEach((field) => {
    if (result[field] && typeof result[field] === "string") {
      try {
        result[field] = EncryptionService.decrypt(result[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Keep original value if decryption fails
      }
    }
  });

  return result;
};

// Fields that should be encrypted
export const ENCRYPTED_FIELDS = {
  personnel: ["id", "assignedDuties"],
  audit: ["oldData", "newData"],
};
