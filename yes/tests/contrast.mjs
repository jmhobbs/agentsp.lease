function channelToLinear(channelByte) {
  const channel = channelByte / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hexColor) {
  const hexDigits = hexColor.replace("#", "");
  const fullHex = hexDigits.length === 3 ? [...hexDigits].map((digit) => digit + digit).join("") : hexDigits;
  const [red, green, blue] = [0, 2, 4].map((offset) => parseInt(fullHex.slice(offset, offset + 2), 16));
  return 0.2126 * channelToLinear(red) + 0.7152 * channelToLinear(green) + 0.0722 * channelToLinear(blue);
}

export function contrastRatio(foregroundHex, backgroundHex) {
  const [lighter, darker] = [relativeLuminance(foregroundHex), relativeLuminance(backgroundHex)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function parseCustomProperties(cssBlock) {
  const tokens = {};
  for (const match of cssBlock.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6})/gi)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
