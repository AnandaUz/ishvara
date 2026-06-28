export const Tools = {
  getTimeStr(date: Date | null | undefined): string {
    if (!date) return "";

    const d = new Date(date);
    const m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    const h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    return `${h}:${m}`;
  },
  async hashSHA256(value: string): Promise<string> {
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value),
    );
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },
  cleanName(name: string): string {
    return name
      .replace(/[^\p{L}\s-]/gu, "") // убираем эмодзи и спецсимволы
      .toLowerCase()
      .trim();
  },

  loess(y: number[], windowSize: number = 10): number[] {
    const n = y.length;
    if (n === 0) return [];

    const result: number[] = new Array<number>(n);
    const k = Math.max(2, Math.min(n, Math.floor(windowSize))); // фиксированный размер окна

    for (let i = 0; i < n; i++) {
      // 1. Определяем границы окна
      const left = Math.max(0, i - Math.floor(k / 2));
      const right = Math.min(n - 1, left + k - 1);

      // если окно вышло за границу — корректируем
      const adjustedLeft = Math.max(0, right - k + 1);
      const adjustedRight = Math.min(n - 1, adjustedLeft + k - 1);

      const x0 = i;

      // 2. Находим максимальное расстояние в окне
      let maxDist = 0;
      for (let j = adjustedLeft; j <= adjustedRight; j++) {
        const dist = Math.abs(j - x0);
        if (dist > maxDist) maxDist = dist;
      }
      if (maxDist === 0 && y[i]) {
        result[i] = y[i] || { weight: 0 };
        continue;
      }

      // 3. Считаем коэффициенты взвешенной линейной регрессии
      let sumW = 0;
      let sumWX = 0;
      let sumWY = 0;
      let sumWXX = 0;
      let sumWXY = 0;

      for (let j = adjustedLeft; j <= adjustedRight; j++) {
        const dist = Math.abs(j - x0) / maxDist;

        // tricube weight
        const w = Math.pow(1 - Math.pow(dist, 3), 3);

        const x = j;
        const yj = y[j]?.weight || 0;

        sumW += w;
        sumWX += w * x;
        sumWY += w * yj;
        sumWXX += w * x * x;
        sumWXY += w * x * yj;
      }

      // Решение weighted least squares для y = a + b*x
      const denom = sumW * sumWXX - sumWX * sumWX;

      let a, b;

      if (denom === 0) {
        a = sumWY / sumW;
        b = 0;
      } else {
        b = (sumW * sumWXY - sumWX * sumWY) / denom;
        a = (sumWY - b * sumWX) / sumW;
      }

      // 4. Прогноз в точке x0
      result[i] = { weight: a + b * x0, date: y[i]?.date || new Date() };
    }

    return result;
  },
};
