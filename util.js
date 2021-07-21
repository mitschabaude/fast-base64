export {urlToOriginal, originalToUrl, concat};

function urlToOriginal(url) {
  return (
    url.replace(/-/g, '+').replace(/_/g, '/') +
    '===='.slice(0, (4 - (url.length % 4)) % 4)
  );
}

function originalToUrl(url) {
  return url.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function concat(...arrays) {
  if (!arrays.length) return null;

  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  let result = new Uint8Array(totalLength);

  let length = 0;
  for (let array of arrays) {
    result.set(array, length);
    length += array.length;
  }

  return result;
}
