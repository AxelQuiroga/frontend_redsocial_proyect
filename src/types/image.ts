export interface PostImage {
  id: string;
  postId: string;
  key: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  order: number;
  deletedAt: string | null;
  createdAt: string;
}

export interface PresignedUpload {
  key: string;
  tempKey: string;
  uploadUrl: string;
  publicUrl: string;
}

export interface PresignResponse {
  uploads: PresignedUpload[];
}

export interface ConfirmResponse {
  images: PostImage[];
}

/** Estado interno de una imagen durante el upload */
export interface ImageUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "confirming" | "done" | "error";
  progress: number;
  error?: string;
  presigned?: PresignedUpload;
  result?: PostImage;
}
