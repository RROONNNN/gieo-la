"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getProvinceCodeByName,
} from "@/lib/data/vnLocations";

interface LocationSelectProps {
  city: string;
  district: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
}

const selectClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";

export default function LocationSelect({
  city,
  district,
  onCityChange,
  onDistrictChange,
}: LocationSelectProps) {
  const provinces = useMemo(() => getProvinces(), []);

  const [provinceCode, setProvinceCode] = useState<string>(() => {
    return city ? (getProvinceCodeByName(city) ?? "") : "";
  });

  const districts = useMemo(
    () => (provinceCode ? getDistrictsByProvinceCode(provinceCode) : []),
    [provinceCode],
  );

  // Sync provinceCode when city prop changes externally
  useEffect(() => {
    if (city) {
      const code = getProvinceCodeByName(city);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProvinceCode(code ?? "");
    } else {
      setProvinceCode("");
    }
  }, [city]);

  function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    const name =
      provinces.find((p) => p.code === code)?.name ?? "";
    setProvinceCode(code);
    onCityChange(name);
    onDistrictChange(""); // reset district when province changes
  }

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onDistrictChange(e.target.value);
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Tỉnh/Thành phố
        </label>
        <select
          value={provinceCode}
          onChange={handleProvinceChange}
          className={selectClass}
        >
          <option value="">Chọn tỉnh/thành phố</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Quận/Huyện
        </label>
        <select
          value={district}
          onChange={handleDistrictChange}
          disabled={!provinceCode}
          className={selectClass}
        >
          <option value="">
            {provinceCode ? "Chọn quận/huyện" : "Chọn tỉnh/thành trước"}
          </option>
          {districts.map((d) => (
            <option key={d.code} value={d.name}>
              {d.name_with_type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
