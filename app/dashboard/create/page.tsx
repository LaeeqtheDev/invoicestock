"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateBusinessInput,
  createBusinessSchema,
} from "@/app/utils/zodSchema";
import Image from "next/image";
import { createBusinessAction } from "@/app/createBusinessAction";

export default function CreateBusinessPage() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBusinessInput>({
    resolver: zodResolver(createBusinessSchema),
  });

  const onSubmit = (data: CreateBusinessInput) => {
    startTransition(async () => {
      const res = await createBusinessAction({
        ...data,
        businessLogo: logoUrl,
      });
      if (res.success) {
        router.push("/dashboard");
      } else {
        alert("Error creating business");
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    );

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        setLogoUrl(data.secure_url);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-xl shadow-lg mt-10 dark:text-white dark:bg-black">
      <h1 className="text-3xl font-bold text-center mb-6">
        Create Your Business
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg">
        <div className="grid grid-cols-1 gap-4">
          <InputField
            label="Business Name"
            {...register("businessName")}
            error={errors.businessName}
          />
          <InputField label="Business Type" {...register("businessType")} />
          <InputField
            label="Business Address"
            {...register("businessAddress")}
          />
          <InputField label="Business Phone" {...register("businessPhone")} />
          <InputField
            label="Business Email"
            {...register("businessEmail")}
            error={errors.businessEmail}
          />
          <InputField label="Business EIN" {...register("businessEIN")} />
          <InputField label="Business VAT" {...register("businessVAT")} />
          <TextAreaField label="Return Policy" {...register("returnPolicy")} />

          {/* File Upload */}
          <div>
            <label className="block font-medium">Business Logo</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
              disabled={isUploading}
            />
            {isUploading && (
              <p className="text-sm text-gray-500">Uploading...</p>
            )}
            {logoUrl && (
              <Image
                src={logoUrl}
                alt="Business Logo"
                width={80}
                height={80}
                className="mt-2 rounded-full border"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-2 rounded-md transition"
          >
            {isPending ? "Creating..." : "Create Business"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusable Input Component
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: { message?: string };
}

const InputField: React.FC<InputFieldProps> = ({ label, error, ...props }) => (
  <div>
    <label className="block font-medium">{label}</label>
    <input
      {...props}
      className="w-full border p-2 rounded focus:ring focus:ring-green-300"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);

// Reusable Textarea Component
interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, ...props }) => (
  <div>
    <label className="block font-medium">{label}</label>
    <textarea
      {...props}
      className="w-full border p-2 rounded focus:ring focus:ring-green-300"
    />
  </div>
);
