"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PutBlobResult } from "@vercel/blob";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { logoPreference } from "@/app/server/module/preference";

interface LogoUploadFormProps {
  organizationSlug: string;
  user_id: string;
}

export function LogoUploadForm({ organizationSlug, user_id }: LogoUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: logoPreferenceByOrganizationId, refetch } = trpc.findOrganizationLogoPreferenceByOrganizationSlug.useQuery({
    id: organizationSlug,
  });

  const preferenceValue = logoPreferenceByOrganizationId?.value as logoPreference;

  // Set existing logo as preview if it exists
  useEffect(() => {
    if (preferenceValue) {
      setPreviewUrl(preferenceValue.logo);
    }
  }, [preferenceValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Revoke previous preview URL to prevent memory leaks
      if (previewUrl && !previewUrl.includes(preferenceValue?.logo || "")) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const logoPreference = trpc.organizationLogoPreference.useMutation({      
    onSuccess: async () => {
      toast.success("Successfully updated logo");
      setSelectedFile(null);
      refetch();
    },
    onError: async (error) => {
      console.error(error);
      toast.error(error.message || "Failed to update logo");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/upload?filename=${selectedFile.name}`,
        {
          method: "POST",
          body: selectedFile,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const newBlob = (await response.json()) as PutBlobResult;

      await logoPreference.mutateAsync({
        user_id: user_id,
        organization_id: organizationSlug,
        id: logoPreferenceByOrganizationId?.id,
        link: newBlob.url
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
      setIsSubmitting(false);
    }
  };

  const handleRemoveLogo = () => {
    if (previewUrl && !previewUrl.includes(preferenceValue?.logo || "")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
        <CardDescription>Upload your organization logo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-4">
            <div className="flex flex-col items-start justify-center gap-4">
              {(previewUrl || preferenceValue?.logo) && (
                <div className="relative w-40 h-40 border rounded-xl">
                  <Image
                    src={previewUrl || preferenceValue?.logo || "/placeholder.svg"}
                    alt="Logo preview"
                    className="w-full h-full object-contain rounded-lg"
                    width={160}
                    height={160}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a PNG, JPG, or GIF file.
                </p>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!selectedFile || isSubmitting}
              className="w-full max-w-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isSubmitting ? "Uploading..." : "Upload Logo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

