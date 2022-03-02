export const images = {
  ".png": "file",
  ".gif": "file",
  ".ico": "file",
  ".jpg": "file",
  ".jpeg": "file",
  ".svg": "file",
  ".webp": "file"
} as const;

export const audio = {
  ".aac": "file",
  ".flac": "file",
  ".mp3": "file",
  ".ogg": "file",
  ".wav": "file"
} as const;

export const video = {
  ".mp4": "file",
  ".webm": "file"
} as const;

export const fonts = {
  ".eot": "file",
  ".otf": "file",
  ".ttf": "file",
  ".woff": "file",
  ".woff2": "file"
} as const;

export default {
  ...images,
  ...audio,
  ...video,
  ...fonts
};
