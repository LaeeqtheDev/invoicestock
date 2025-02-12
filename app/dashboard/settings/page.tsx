"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ------------------------
// Business Details Getter
// ------------------------

export interface BusinessDetails {
  id: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessEIN: string;
  businessVAT: string;
  businessLogo: string;
  businessPhone: string;
}

/**
 * Fetch business details for the current user.
 * This function calls your API endpoint (e.g. /api/business) and returns a business record.
 */
async function getBusinessDetails(): Promise<BusinessDetails> {
  const res = await fetch("/api/business", {
    // Optionally: cache: "no-store",
  });
  console.log("Response from /api/business:", res);
  if (!res.ok) {
    throw new Error("Failed to fetch business details");
  }
  return res.json();
}

// ------------------------
// Settings Page Component
// ------------------------

export default function SettingsPage() {
  const router = useRouter();

  // We'll store the business ID separately so that we can use it in our API calls.
  const [businessId, setBusinessId] = useState<string>("");
  // Settings state holds the business details we want to display and update.
  const [settings, setSettings] = useState({
    businessName: "",
    businessAddress: "",
    businessEmail: "",
    businessEIN: "",
    businessVAT: "",
    businessLogo: "",
    businessPhone: "",
  });

  // Fetch the existing business settings when the component mounts.
  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getBusinessDetails();
        console.log("Fetched Business Details:", data);
        // Update state with the fetched settings.
        setSettings({
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          businessEmail: data.businessEmail,
          businessEIN: data.businessEIN,
          businessVAT: data.businessVAT,
          businessLogo: data.businessLogo,
          businessPhone: data.businessPhone,
        });
        // Save the business id for later use.
        setBusinessId(data.id);
      } catch (error: any) {
        console.error("Error fetching settings:", error.message);
        alert("Error fetching settings: " + error.message);
      }
    }
    fetchSettings();
  }, []);

  // Update state when input fields change.
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the updated settings.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      alert("Business ID not found");
      return;
    }
    try {
      const res = await fetch(`/api/settings/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        throw new Error("Failed to update settings");
      }
      alert("Settings updated successfully!");
      // Optionally, you can refresh the page or navigate elsewhere:
      // router.push("/dashboard/settings");
    } catch (error: any) {
      alert("Error updating settings: " + error.message);
    }
  };

  return (
    <Card className="w-full mx-auto p-6">
      <CardContent>
        <h1 className="text-2xl font-bold mb-4">Business Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              value={settings.businessName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              name="businessAddress"
              type="text"
              value={settings.businessAddress}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              name="businessEmail"
              type="email"
              value={settings.businessEmail}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="businessEIN">Business EIN</Label>
            <Input
              id="businessEIN"
              name="businessEIN"
              type="text"
              value={settings.businessEIN}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="businessVAT">Business VAT</Label>
            <Input
              id="businessVAT"
              name="businessVAT"
              type="text"
              value={settings.businessVAT}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="businessPhone">Business Phone</Label>
            {/* Changed type to "text" so that values like "+923324265921" can be handled */}
            <Input
              id="businessPhone"
              name="businessPhone"
              type="text"
              value={settings.businessPhone}
              onChange={handleChange}
            />
          </div>
          <div>
            <Button type="submit">Update Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
