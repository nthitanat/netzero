import { getEventImages, getEventPrimaryImage, getImagePlaceholderUrl, handleImageError,
  resolveImageUrl } from './imageUtils';

jest.mock('../api', () => ({
  eventsService: {
    getEventPosterUrl: id => `/old/events/${id}/poster`,
    getEventThumbnailUrl: id => `/old/events/${id}/thumbnail`
  }
}));

test('event images prefer response links and use URL helpers for older responses', () => {
  expect(getEventImages({
    id: 11, poster_url: 'https://api.example.test/events/11/poster',
    thumbnail_url: 'https://api.example.test/events/11/thumbnail'
  })).toEqual([
    'https://api.example.test/events/11/poster',
    'https://api.example.test/events/11/thumbnail'
  ]);
  expect(getEventPrimaryImage({ id: 12 })).toBe('/old/events/12/poster');
});

test('explicit null omits slides and shows a placeholder without legacy requests', () => {
  const event = { id: 11, poster_url: null, thumbnail_url: null };
  expect(getEventImages(event)).toEqual([]);
  expect(getEventPrimaryImage(event)).toBe(getImagePlaceholderUrl());
  expect(resolveImageUrl(null, () => '/old/product/11/thumbnail')).toBeNull();
  expect(resolveImageUrl(undefined, () => '/old/product/11/thumbnail'))
    .toBe('/old/product/11/thumbnail');
});

test('a single present event image remains the only slide', () => {
  expect(getEventImages({ id: 11, poster_url: null, thumbnail_url: '/events/11/thumbnail' }))
    .toEqual(['/events/11/thumbnail']);
});

test('a failed image request switches to the local placeholder once', () => {
  const image = { src: 'https://api.example.test/missing.png', onerror: handleImageError };
  handleImageError({ currentTarget: image });
  expect(image.src).toBe(getImagePlaceholderUrl());
  expect(image.onerror).toBeNull();
  handleImageError({ currentTarget: image });
  expect(image.src).toBe(getImagePlaceholderUrl());
});
