export const getMeetupCoverUrl = (meetup) => {
  const images = meetup?.images || [];
  const main = images.find((img) => img.isMain) || images[0];
  return main?.url || meetup?.bannerImage?.url || null;
};

export const getMeetupImages = (meetup) => {
  const images = meetup?.images || [];
  if (images.length > 0) return images;
  if (meetup?.bannerImage?.url) return [meetup.bannerImage];
  return [];
};

export const DEFAULT_MEETUP_IMAGE =
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600';
