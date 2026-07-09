export const ServerTools = {
  arrays: {
    /** Эквивалентны ли массивы */
    arraysEqual(a: number[], b: number[]): boolean {
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort((x, y) => x - y);
      const sortedB = [...b].sort((x, y) => x - y);
      return sortedA.every((val, i) => val === sortedB[i]);
    },
    /** Проверяет содержится масив а в массиве b
     * @param a - массив который проверяем
     * @param b - массив в котором ищем
     * @returns true если массив a полностью содержится в массиве b
     */
    isSubset(a: number[], b: number[]): boolean {
      const setB = new Set(b);
      return a.every((val) => setB.has(val));
    },
    /**
     * Проверяет есть ли пересечение масивов
     * @param a - первый массив
     * @param b - массив в котором ищем
     * @returns true если есть пересечение
     */
    hasIntersection(a: number[], b: number[]): boolean {
      const setB = new Set(b);
      return a.some((val) => setB.has(val));
    },
  },
};
