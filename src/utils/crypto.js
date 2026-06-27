// Generate a new AES-256-GCM key
export async function generateAESKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}
// Export AES key to raw format
export async function exportKey(key) {
  const exportedKey = await window.crypto.subtle.exportKey(
    "raw",
    key
  );

  return btoa(
    String.fromCharCode(...new Uint8Array(exportedKey))
  );
}
// Import AES key from Base64 string
export async function importKey(base64Key) {
  const rawKey = Uint8Array.from(
    atob(base64Key),
    (char) => char.charCodeAt(0)
  );

  return await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM",
    },
    true,
    ["decrypt"]
  );
}
// Decrypt an encrypted file
export async function decryptFile(
  encryptedBuffer,
  key,
  iv
) {
  const decryptedBuffer =
    await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedBuffer
    );

  return decryptedBuffer;
}
// Encrypt a file using AES-GCM
export async function encryptFile(file, key) {

  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Generate a random Initialization Vector (IV)
  const iv = window.crypto.getRandomValues(
    new Uint8Array(12)
  );

  // Encrypt the file
  const encryptedBuffer =
    await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      fileBuffer
    );

  return {
    encryptedBuffer,
    iv,
  };
}
// Convert encrypted data into a file
export function createEncryptedFile(
  encryptedBuffer,
  originalFile
) {
  return new File(
    [encryptedBuffer],
    `${originalFile.name}.enc`,
    {
      type: "application/octet-stream",
    }
  );
}
// Convert IV to Base64 string
export function exportIV(iv) {
  return btoa(
    String.fromCharCode(...iv)
  );
}