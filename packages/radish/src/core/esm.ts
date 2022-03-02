export default function esm<T = unknown>(src: string): Promise<T> {
  const dataUri =
    "data:text/javascript;charset=utf-8," + encodeURIComponent(src);
  return import(dataUri);
}
