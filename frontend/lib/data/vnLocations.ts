import tinhTpRaw from "./tinh_tp.json";
import quanHuyenRaw from "./quan_huyen.json";

export interface Province {
  code: string;
  name: string;
  name_with_type: string;
  slug: string;
  type: string;
}

export interface District {
  code: string;
  name: string;
  name_with_type: string;
  slug: string;
  type: string;
  parent_code: string;
}

type RawProvince = {
  name: string;
  name_with_type?: string;
  slug: string;
  type: string;
};

type RawDistrict = {
  name: string;
  name_with_type?: string;
  slug: string;
  type: string;
  parent_code: string;
  code: string;
};

const tinhTp = tinhTpRaw as Record<string, RawProvince>;
const quanHuyen = quanHuyenRaw as Record<string, RawDistrict>;

export function getProvinces(): Province[] {
  return Object.entries(tinhTp)
    .map(([code, p]) => ({
      code,
      name: p.name,
      name_with_type: p.name_with_type ?? p.name,
      slug: p.slug,
      type: p.type,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export function getDistrictsByProvinceCode(provinceCode: string): District[] {
  return Object.values(quanHuyen)
    .filter((d) => d.parent_code === provinceCode)
    .map((d) => ({
      code: d.code,
      name: d.name,
      name_with_type: d.name_with_type ?? d.name,
      slug: d.slug,
      type: d.type,
      parent_code: d.parent_code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

/** Returns province code for a given province name (e.g. "Hà Nội" → "01") */
export function getProvinceCodeByName(name: string): string | undefined {
  const entry = Object.entries(tinhTp).find(([, p]) => p.name === name);
  return entry?.[0];
}
