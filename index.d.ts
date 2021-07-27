export function toBytes(base64: string): Promise<Uint8Array>;
export function toBase64(bytes: Uint8Array): Promise<string>;

declare module 'small' {
  export function toBytes(base64: string): Promise<Uint8Array>;
  export function toBase64(bytes: Uint8Array): Promise<string>;
}

declare module 'js' {
  export function toBytes(base64: string): Uint8Array;
  export function toBase64(bytes: Uint8Array): string;
}

declare module 'url' {
  export function fromUrl(base64url: string): string;
  export function toUrl(base64: string): string;
}
