import slugify from "slugify";

export const createSlug = (title: string, locationName?: string) => {
  // Combine title and location for more descriptive URLs
  const slugParts = [title];
  if (locationName && locationName.trim()) {
    slugParts.push(locationName.trim());
  }
  
  const combinedText = slugParts.join(' ');
  const slugBase = slugify(combinedText, { lower: true, strict: true });
  
  return slugBase;
};

export const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
