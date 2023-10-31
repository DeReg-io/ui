export function numToHumanText(value: number) {
  if (!value) return 0;
  if (value > 1000000000 || value < -1000000000) {
    return `${Math.round((value * 10) / 1000000000) / 10}B`;
  } else if (value > 1000000 || value < -1000000) {
    return `${Math.round((value * 10) / 1000000) / 10}M`;
  } else if (value > 1000 || value < -1000) {
    return `${Math.round((value * 10) / 1000) / 10}K`;
  } else {
    return `${Math.round(value * 10) / 10}`;
  }
}
