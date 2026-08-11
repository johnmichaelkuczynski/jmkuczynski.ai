export function serializeAccomplishment<T extends { createdAt: Date }>(
  row: T,
) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
