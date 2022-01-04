export {
  toBytesSimple,
  toBase64Simple,
  toBytesCharCodeAt,
  toBytesStringLookup,
  toBase64StringLookup,
  toBytesDataUri,
  toBase64DataUri,
};

function toBytesSimple(str) {
  let rawStr = atob(str);
  let n = rawStr.length;
  let bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bytes[i] = rawStr.charCodeAt(i);
  }
  return bytes;
}

function toBase64Simple(bytes) {
  let n = bytes.length;
  let chars = new Array(n);
  for (let i = 0; i < n; i++) {
    chars[i] = String.fromCharCode(bytes[i]);
  }
  return btoa(chars.join(''));
}

async function toBytesDataUri(base64) {
  let dataUri = 'data:application/octet-stream;base64,' + base64;
  return new Uint8Array(await (await fetch(dataUri)).arrayBuffer());
}

async function toBase64DataUri(bytes) {
  let reader = new FileReader();
  let promise = new Promise(resolve => {
    reader.onload = () => resolve(reader.result);
  });
  let blob = new Blob([bytes.buffer], {type: 'application/octet-stream'});
  reader.readAsDataURL(blob);
  return (await promise).replace('data:application/octet-stream;base64,', '');
}

const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [a.charCodeAt(0), i])
);
lookup['='.charCodeAt(0)] = 0;
lookup['-'.charCodeAt(0)] = 62;
lookup['_'.charCodeAt(0)] = 63;

const strLookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [a, i])
);
strLookup['='] = 0;

const strEncodeLookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [i, a])
);

function toBytesCharCodeAt(base64) {
  base64 = base64.replace(/=/g, '');
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1; // how many bytes the last base64 chunk encodes
  let m = (n >> 2) * 3 + k; // total encoded bytes
  base64 += '===';
  let bytes = new Uint8Array(m + 3);

  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
    let x1 = lookup[base64.charCodeAt(i + 0)] << 18;
    let x2 = lookup[base64.charCodeAt(i + 1)] << 12;
    let x3 = lookup[base64.charCodeAt(i + 2)] << 6;
    let x4 = lookup[base64.charCodeAt(i + 3)];
    bytes[j + 0] = (x1 + x2) >> 16;
    bytes[j + 1] = ((x2 + x3) >> 8) & 0xff;
    bytes[j + 2] = (x3 + x4) & 0xff;
  }

  return new Uint8Array(bytes.buffer, 0, m);
}

function toBytesStringLookup(base64) {
  base64 = base64.replace(/=/g, '');
  let n = base64.length;
  let rem = n % 4;
  let k = rem && rem - 1; // how many bytes the last base64 chunk encodes
  let m = (n >> 2) * 3 + k; // total encoded bytes
  base64 += '===';
  let bytes = new Uint8Array(m + 3);

  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
    let x1 = strLookup[base64[i + 0]] << 18;
    let x2 = strLookup[base64[i + 1]] << 12;
    let x3 = strLookup[base64[i + 2]] << 6;
    let x4 = strLookup[base64[i + 3]];
    bytes[j + 0] = (x1 + x2) >> 16;
    bytes[j + 1] = ((x2 + x3) >> 8) & 0xff;
    bytes[j + 2] = (x3 + x4) & 0xff;
  }

  return new Uint8Array(bytes.buffer, 0, m);
}

function toBase64StringLookup(bytes) {
  let m = bytes.length;
  let k = m % 3;
  let n = Math.floor(m / 3) * 4 + (k && k + 1);
  let N = Math.ceil(m / 3) * 4;
  let encoded = new Array(N);

  for (let i = 0, j = 0; j < m; i += 4, j += 3) {
    let y1 = bytes[j + 0] << 16;
    let y2 = bytes[j + 1] << 8;
    let y3 = bytes[j + 2] | 0;
    encoded[i + 0] = strEncodeLookup[y1 >> 18];
    encoded[i + 1] = strEncodeLookup[((y1 + y2) >> 12) & 0x3f];
    encoded[i + 2] = strEncodeLookup[((y2 + y3) >> 6) & 0x3f];
    encoded[i + 3] = strEncodeLookup[y3 & 0x3f];
  }

  let base64 = encoded.join('').slice(0, n);
  if (k === 1) base64 += '==';
  if (k === 2) base64 += '=';
  return base64;
}

// functions implementing the base64 lookups algebraically (used in wasm)

function char2num(x) {
  return (
    x + 4 - (x > 64) * 69 - (x > 96) * 6 + (x === 43) * 15 + (x === 47) * 12
  );
}

function num2char(x) {
  return (
    x + 65 + (x > 25) * 6 - (x > 51) * 75 - (x === 62) * 15 - (x === 63) * 12
  );
}

//  65  66  67  68  69  70  71  72  73  74  75  76  77  78  79  80  81  82  83  84  85  86  87  88  89  90  97  98  99 100 101 102
//   0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31

// 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122  48  49  50  51  52  53  54  55  56  57  43  47
//  32  33  34  35  36  37  38  39  40  41  42  43  44  45  46  47  48  49  50  51  52  53  54  55  56  57  58  59  60  61  62  63
