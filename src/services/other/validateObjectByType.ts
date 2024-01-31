type AllowedKeys<T> = (keyof T)[];


export function filterObjectByType<T extends Record<string, unknown>>(
    obj: T,
    allowedKeys: AllowedKeys<T>
): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([key]) => allowedKeys.includes(key as keyof T))
    ) as Partial<T>;
}