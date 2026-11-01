function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}

export function bufferToWav(buffer: AudioBuffer, bits: 16 | 24) {
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  const bytesPer = bits / 8;
  const block = channels * bytesPer;
  const dataSize = length * block;
  const array = new ArrayBuffer(44 + dataSize);
  const view = new DataView(array);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * block, true);
  view.setUint16(32, block, true);
  view.setUint16(34, bits, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
  let p = 44;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < channels; c++) {
      const s = Math.max(-1, Math.min(1, data[c][i]));
      if (bits === 16) {
        view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        p += 2;
      } else {
        const v = s < 0 ? Math.round(s * 0x800000) : Math.round(s * 0x7fffff);
        view.setUint8(p, v & 0xff);
        view.setUint8(p + 1, (v >> 8) & 0xff);
        view.setUint8(p + 2, (v >> 16) & 0xff);
        p += 3;
      }
    }
  }
  return new Blob([array], { type: "audio/wav" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
