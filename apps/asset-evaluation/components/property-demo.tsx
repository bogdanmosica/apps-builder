"use client";

import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";

interface PropertyDemoProps {
  trigger?: React.ReactNode;
}

export default function PropertyDemo({ trigger }: PropertyDemoProps) {
  const router = useRouter();

  const handleOpenDemo = () => {
    router.push("/demo");
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleOpenDemo} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button variant="outline" size="lg" onClick={handleOpenDemo}>
          View Demo
        </Button>
      )}
    </>
  );
}
