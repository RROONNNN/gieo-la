"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { BASE_URL } from "@/lib/api/endpoints";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 20 * 1024 * 1024;

interface DocumentGroupInputProps {
  index: number;
  label: string;
  uploadedUrls: string[];
  uploading: boolean;
  uploadError: string | null;
  onLabelChange: (index: number, value: string) => void;
  onImagesAdded: (index: number, files: FileList) => void;
  onImageRemove: (groupIndex: number, imageIndex: number) => void;
  onGroupRemove: (index: number) => void;
  canRemove: boolean;
}

export function DocumentGroupInput({
  index,
  label,
  uploadedUrls,
  uploading,
  uploadError,
  onLabelChange,
  onImagesAdded,
  onImageRemove,
  onGroupRemove,
  canRemove,
}: DocumentGroupInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    // Client-side format/size check before passing to parent
    for (const file of Array.from(e.target.files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`"${file.name}": Định dạng không hỗ trợ. Vui lòng dùng JPG, PNG hoặc WEBP.`);
        e.target.value = "";
        return;
      }
      if (file.size > MAX_BYTES) {
        alert(`"${file.name}": Ảnh vượt quá giới hạn 20 MB.`);
        e.target.value = "";
        return;
      }
    }

    onImagesAdded(index, e.target.files);
    e.target.value = "";
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground w-6 shrink-0">
          {index + 1}.
        </span>
        <Input
          id={`doc-label-${index}`}
          label="Tên loại giấy tờ"
          placeholder="VD: Hộ nghèo, Xác nhận địa phương..."
          value={label}
          onChange={(e) => onLabelChange(index, e.target.value)}
        />
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onGroupRemove(index)}
            className="text-red-500 hover:text-red-700 shrink-0"
          >
            Xóa
          </Button>
        )}
      </div>

      {/* Uploaded images thumbnails */}
      {uploadedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedUrls.map((url, imgIdx) => (
            <div key={imgIdx} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE_URL}${url}`}
                alt={`Ảnh ${imgIdx + 1} của ${label || `loại ${index + 1}`}`}
                className="h-20 w-20 rounded object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => onImageRemove(index, imgIdx)}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Xóa ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Spinner size="sm" />
              <span className="ml-1">Đang tải lên...</span>
            </>
          ) : (
            "Chọn ảnh"
          )}
        </Button>
        <span className="text-xs text-muted-foreground">JPG, PNG, WEBP — tối đa 20 MB/ảnh</span>
      </div>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
