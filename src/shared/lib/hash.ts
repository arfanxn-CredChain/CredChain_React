/**
 * Compute SHA-256 hash of a File using Web Crypto.
 * Returns 0x-prefixed lowercase hex string (matches backend hash format).
 * Uses FileReader for broad compatibility (including jsdom in tests).
 */
export async function sha256File(file: File): Promise<string> {
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("FileReader did not return ArrayBuffer"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
    reader.readAsArrayBuffer(file);
  });
  return hashBuffer(buffer);
}

export async function sha256Text(text: string): Promise<string> {
  const buffer = new TextEncoder().encode(text);
  return hashBuffer(buffer);
}

async function hashBuffer(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const view = (
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  ) as Uint8Array<ArrayBuffer>;
  const digest = await crypto.subtle.digest("SHA-256", view);
  const hashArray = Array.from(new Uint8Array(digest));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}
