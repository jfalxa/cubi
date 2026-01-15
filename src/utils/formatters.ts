export function meter(dimension: number) {
	return `${(dimension / 10).toFixed(2)}m`.replace('.00', '');
}
