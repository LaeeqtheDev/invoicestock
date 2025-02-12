"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface iAppProps {
  text: string;
  disabled?: boolean; // Optional disabled prop
  loading?: boolean;
}

export function SubmitButton({ text, disabled }: iAppProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? (
        <>
          <Loader2 className="size-4 mr-2 animate-spin" /> Please wait...
        </>
      ) : (
        text
      )}
    </Button>
  );
}
