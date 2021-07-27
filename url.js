export {fromUrl, toUrl};

function fromUrl(url) {
  return (
    url.replace(/-/g, '+').replace(/_/g, '/') +
    '===='.slice(0, (4 - (url.length % 4)) % 4)
  );
}

function toUrl(url) {
  return url.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
