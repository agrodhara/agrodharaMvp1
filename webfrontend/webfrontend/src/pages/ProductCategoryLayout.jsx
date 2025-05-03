import { Outlet } from "react-router-dom";

const ProductCategoryLayout = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product Categories</h1>
      <Outlet /> {/* renders the dynamic child */}
    </div>
  );
};

export default ProductCategoryLayout;
