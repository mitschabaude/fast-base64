export {toBytesSimple, toBase64Simple, toBytesCharCodeAt, toBytesStringLookup};

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
  let rawStr = '';
  for (let i = 0; i < n; i++) {
    rawStr += String.fromCharCode(bytes[i]);
  }
  return btoa(rawStr);
}

const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [a.charCodeAt(0), i])
);
lookup['='.charCodeAt(0)] = 0;
lookup['-'.charCodeAt(0)] = 62;
lookup['_'.charCodeAt(0)] = 63;

const encodeLookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [i, a.charCodeAt(0)])
);
const strLookup = Object.fromEntries(
  Array.from(alphabet).map((a, i) => [a, i])
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
