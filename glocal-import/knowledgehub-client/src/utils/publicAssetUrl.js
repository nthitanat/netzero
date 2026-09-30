export const publicAssetUrl = (path) =>
  `${process.env.PUBLIC_URL}/${path.replace(/^\/+/, '')}`;
