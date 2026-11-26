export const PAGE = 1000;

export async function toutesLesPages<T>(
  lire: (
    de: number,
    a: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  quoi: string,
): Promise<T[]> {
  const lignes: T[] = [];
  for (let de = 0; ; de += PAGE) {
    const { data, error } = await lire(de, de + PAGE - 1);
    if (error) throw new Error(`${quoi} illisible : ${error.message}`);
    lignes.push(...(data ?? []));
    if (!data || data.length < PAGE) return lignes;
  }
}
