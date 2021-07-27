export function toBytes(base64: string): Promise<Uint8Array>;
export function toBase64(bytes: Uint8Array): Promise<string>;

declare module 'fast-base64/small' {
  export function toBytes(base64: string): Promise<Uint8Array>;
  export function toBase64(bytes: Uint8Array): Promise<string>;
}

declare module 'fast-base64/js' {
  export function toBytes(base64: string): Uint8Array;
  export function toBase64(bytes: Uint8Array): string;
}

declare module 'fast-base64/url' {
  export function fromUrl(base64url: string): string;
  export function toUrl(base64: string): string;
}
