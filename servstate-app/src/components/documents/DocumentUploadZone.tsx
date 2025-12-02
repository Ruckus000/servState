'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUploadDocument } from '@/hooks/use-documents';
import { toast } from 'sonner';
import type { DocumentType } from '@/types';

interface DocumentUploadZoneProps {
  loanId: string;
  onUploadSuccess?: () => void;
}

export function DocumentUploadZone({ loanId, onUploadSuccess }: DocumentUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('Statement');
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadDocument();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        loan_id: loanId,
        name: selectedFile.name,
        type: documentType,
        size: selectedFile.size,
        contentType: selectedFile.type,
        file: selectedFile,
      });

      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      onUploadSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}
          ${selectedFile ? 'bg-gray-50 dark:bg-gray-800' : ''}
        `}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 text-left">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">Drop your file here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx,.xls,.xlsx"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild className="mt-2">
                <span>Browse Files</span>
              </Button>
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Supported: PDF, Images, Word, Excel (Max 100MB)
            </p>
          </div>
        )}
      </div>

      {/* Document Type Selector */}
      {selectedFile && (
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
            <SelectTrigger id="document-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Statement">Statement</SelectItem>
              <SelectItem value="Disclosure">Disclosure</SelectItem>
              <SelectItem value="Correspondence">Correspondence</SelectItem>
              <SelectItem value="Tax">Tax</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Insurance">Insurance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          className="w-full"
        >
          {uploadMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      )}
    </div>
  );
}
