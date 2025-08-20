import slugify from "slugify";

export const createSlug = (title: string) => {
  const slugBase = slugify(title, { lower: true, strict: true });
  return `${slugBase}-${Date.now().toString(36)}`;
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
