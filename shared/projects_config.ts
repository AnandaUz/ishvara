import type {
  IAd,
  IAdSet,
  ICompany,
  IBigProjectConfig,
  IProjectEntity,
} from "./types/IProjectEntity.js";

export type { IAd, IAdSet, ICompany, IBigProjectConfig };

export const bigProjectsRegistry = {
  projects: [] as IProjectEntity[],
  setProjects(list: IProjectEntity[]) {
    this.projects = list;
  },
};

export const bigProjects: IBigProjectConfig[] = [];

export const bigProjectsGet = {
  projectById: (id: number): IBigProjectConfig | undefined => {
    const found = bigProjectsRegistry.projects.find(
      (p) => p.projectId === id || (p as any).id === id,
    );
    if (!found) return undefined;
    return {
      ...found,
      id: found.projectId,
      pixel: found.pixelId || (found as any).pixel,
    };
  },
  companyById: (projectId: number, companyId: number): ICompany | undefined => {
    return bigProjectsGet
      .projectById(projectId)
      ?.companys?.find((c) => c.id === companyId);
  },
  adsetById: (
    projectId: number,
    companyId: number,
    adsetId: number,
  ): IAdSet | undefined => {
    return bigProjectsGet
      ?.companyById(projectId, companyId)
      ?.adsets?.find((a) => a.id === adsetId);
  },
  adById: (
    projectId: number,
    companyId: number,
    adsetId: number,
    adId: number,
  ): IAd | undefined => {
    return bigProjectsGet
      ?.adsetById(projectId, companyId, adsetId)
      ?.ads?.find((a) => a.id === adId);
  },
} as const;
