import { post, postRaw } from "@/api/client";

type Criteria = Record<string, unknown>;

async function getByCriteria(endpoint: string, criteria: Criteria = {}) {
  // The backend expects POST { data: criteria } on `${endpoint}/getByCriteria`
  const { data } = await post(`${endpoint}/getByCriteria`, criteria);
  return data as any;
}

export async function getDepartments() {
  return getByCriteria("/departerment", {});
}

export async function getCities(departmentCode: string) {
  return getByCriteria("/ville", { codeDepartement: departmentCode || "" });
}

export async function getCommunes(cityId: string) {
  return getByCriteria("/wcommunes", { idWVille: cityId || "" });
}

export async function getQuartiers(communeId: string) {
  return getByCriteria("/quartier", { idwCommunes: communeId || "" });
}

export async function getAgents(communeId: string) {
  void communeId;
  const { data } = await postRaw(
    "/wUtilisateur/rechercheAllPdv",
    {
      data: {},
    },
    { forceToken: true }
  );
  return data as any;
}

