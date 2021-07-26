export {urlToOriginal, originalToUrl};

function urlToOriginal(url) {
  return (
    url.replace(/-/g, '+').replace(/_/g, '/') +
    '===='.slice(0, (4 - (url.length % 4)) % 4)
  );
}

function originalToUrl(url) {
  return url.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
