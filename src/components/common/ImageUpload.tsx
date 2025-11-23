import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File) => void;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({ value, onChange, onFileChange, maxSizeMB = 1, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileName = (fileName: string): boolean => {
    const regex = /^[a-zA-Z0-9._-]+$/;
    return regex.test(fileName);
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    try {
      const compressedFile = await imageCompression(file, options);
      
      if (compressedFile.size > maxSizeMB * 1024 * 1024) {
        const furtherOptions = {
          ...options,
          maxSizeMB: maxSizeMB * 0.8,
          initialQuality: 0.7
        };
        return await imageCompression(compressedFile, furtherOptions);
      }
      
      return compressedFile;
    } catch (error) {
      console.error('图片压缩失败:', error);
      throw new Error('图片压缩失败');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileName(file.name)) {
      toast.error('文件名只能包含英文字母和数字');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      toast.error('仅支持 JPEG、PNG、GIF、WEBP、AVIF 格式的图片');
      return;
    }

    setUploading(true);

    try {
      let processedFile = file;
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > maxSizeMB) {
        toast.info('图片超过大小限制，正在自动压缩...');
        processedFile = await compressImage(file);
        const compressedSizeMB = (processedFile.size / (1024 * 1024)).toFixed(2);
        toast.success(`图片已压缩至 ${compressedSizeMB}MB`);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
        if (onFileChange) {
          onFileChange(processedFile);
        }
      };
      reader.readAsDataURL(processedFile);
    } catch (error: any) {
      toast.error(error.message || '图片处理失败');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="预览"
            className="w-full h-48 object-cover rounded-lg border border-border"
            crossOrigin="anonymous"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-48 border-2 border-dashed border-border hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">处理中...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">点击上传图片</span>
              <span className="text-xs text-muted-foreground">支持 JPEG、PNG、GIF、WEBP、AVIF</span>
              <span className="text-xs text-muted-foreground">最大 {maxSizeMB}MB</span>
            </div>
          )}
        </Button>
      )}
    </div>
  );
}
