"use client";

import { useEffect, useState } from "react";

interface PropertyType {
  id: number;
  name_ro: string;
  name_en: string | null;
}

export function usePropertyTypes() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/property-types");

        if (!response.ok) {
          throw new Error("Failed to fetch property types");
        }

        const result = await response.json();

        if (result.success) {
          setPropertyTypes(result.data);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (err) {
        console.error("Error fetching property types:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyTypes();
  }, []);

  return { propertyTypes, loading, error };
}
