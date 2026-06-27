export async function importAESKey(base64Key) {
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
export async function decryptFile(
  encryptedData,
  cryptoKey,
  iv
) {
  const decryptedBuffer =
    await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      encryptedData
    );

  return decryptedBuffer;
}