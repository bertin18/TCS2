import test from 'node:test';
import assert from 'node:assert/strict';
import { colors } from '../src/theme.ts';

function luminance(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function ratio(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
test('pares de texto da interface atingem 4,5:1', () => {
  const bgs = [colors.background, colors.surface, colors.mint, colors.pressed, colors.line, '#FAFCF9', '#EDF6F5', '#FFF5E8'];
  const pairs = bgs.flatMap(bg => [[colors.ink, bg], [colors.muted, bg], [colors.forest, bg]]);
  pairs.push(['#FFFFFF', colors.forest], ['#FFFFFF', colors.ink], [colors.lime, colors.forest],
    ['#D8E8DE', colors.forest], [colors.error, colors.errorBackground], [colors.error, colors.surface],
    [colors.green, colors.background]);
  for (const [fg, bg] of pairs) assert.ok(ratio(fg, bg) >= 4.5, `${fg} em ${bg}: ${ratio(fg, bg).toFixed(2)}`);
});
test('bordas dos campos e progresso atingem 3:1', () => {
  for (const [fg, bg] of [[colors.inputBorder, '#FAFCF9'], [colors.forest, colors.surface],
    [colors.error, colors.errorBackground], [colors.green, colors.mint]]) {
    assert.ok(ratio(fg, bg) >= 3, `${fg} em ${bg}: ${ratio(fg, bg).toFixed(2)}`);
  }
});
