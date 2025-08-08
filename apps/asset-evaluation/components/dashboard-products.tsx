"use client";

import { useState } from "react";
import AddProductModal from "./add-product-modal";
import ProductsList from "./products-list";

export function DashboardProducts() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProductAdded = () => {
    // Increment key to force ProductsList to refresh
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your SaaS.
          </p>
        </div>
        <AddProductModal onProductAdded={handleProductAdded} />
      </div>

      <div className="mt-8">
        <ProductsList key={refreshKey} />
      </div>
    </>
  );
}
