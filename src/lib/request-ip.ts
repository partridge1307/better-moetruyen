export const requestIp = (headers: Headers) => {
  const ip =
    headers.get('x-client-ip') ||
    headers.get('x-forwarded-for') ||
    headers.get('cf-connecting-ip') ||
    headers.get('true-client-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded') ||
    headers.get('forwarded-for') ||
    headers.get('forwarded');

  return ip;
};
