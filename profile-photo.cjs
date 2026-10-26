// Only small, self-contained JPEGs are accepted; no external URLs or executable formats.
function validateProfilePhoto(value) {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length > 80023) return false;
  const encoded = value.slice(23);
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length < 4 || bytes.toString('base64') !== encoded || bytes.length > 60000 || bytes.readUInt16BE(0) !== 0xffd8 || bytes.readUInt16BE(bytes.length - 2) !== 0xffd9) return false;
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset++] !== 0xff) return false;
    const marker = bytes[offset++];
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) return false;
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      if (length < 8) return false;
      const height = bytes.readUInt16BE(offset + 3), width = bytes.readUInt16BE(offset + 5);
      return width > 0 && height > 0 && width <= 512 && height <= 512;
    }
    if (marker === 0xda || marker === 0xd9) return false;
    offset += length;
  }
  return false;
}
module.exports = { validateProfilePhoto };
