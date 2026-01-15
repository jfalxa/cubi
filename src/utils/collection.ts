export function indexById<T extends { id: string }>(list: T[]): Record<string, T> {
	const byId: Record<string, T> = {};
	for (const item of list) byId[item.id] = item;
	return byId;
}

export function groupBy<T>(list: T[], predicate: (i: T) => string | undefined) {
	const grouped: Record<string, T[]> = {};
	for (const item of list) {
		const group = String(predicate(item));
		grouped[group] = grouped[group] ?? [];
		grouped[group].push(item);
	}
	return grouped;
}
