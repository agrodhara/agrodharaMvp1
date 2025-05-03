// import { useNavigate, useParams } from "react-router-dom";

// const ProductItemDetail = () => {
//   const { categorySlug, itemSlug } = useParams();
//   const navigate = useNavigate();
//   const itemName = itemSlug.replace(/-/g, " ");

//   return (
//     <div className="min-h-screen bg-gradient-to-tr from-[#f0fff4] to-[#e6fff8] p-4 sm:p-6">
//       <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 sm:px-8 pt-6">
//           <button onClick={()=>navigate(`/product-category/${categorySlug}`)} className="text-gray-500 hover:text-[#0E9F6E] transition font-medium">
//             ← Back
//           </button>
//           <span className="text-sm font-medium text-gray-400 capitalize">
//             Category: {categorySlug.replace(/-/g, " ")}
//           </span>
//         </div>

//         {/* Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 sm:p-10">
//           {/* Image Section */}
//           <div className="flex justify-center items-center">
//             <img
//               src="/images/sample-crop.jpg"
//               alt={itemName}
//               className="rounded-xl shadow-md w-full h-[350px] object-cover max-w-xl"
//             />
//           </div>

//           {/* Details Section */}
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E9F6E] capitalize mb-6">
//               {categorySlug}
//             </h1>

//             <div className="space-y-5 text-gray-700 text-base leading-relaxed">
//               <p>
//                 <strong>Price:</strong>{" "}
//                 <span className="text-[#0E9F6E] font-semibold">₹ 2000 / Quintal</span>
//               </p>
//               <p>
//                 <strong>Available Quantity:</strong>{" "}
//                 <span className="font-medium">1000kg</span>
//               </p>
//               <p>
//                 <strong>Description:</strong>{" "}
//                 Premium quality, export-grade{" "}
//                 <span className="capitalize font-medium">{itemName}</span> with
//                 organic certifications, high purity, and excellent taste profile
//                 for gourmet and commercial use.
//               </p>
//             </div>

//             {/* CTA Buttons */}
//             <div className="mt-8 flex flex-col sm:flex-row gap-4">
//               <button onClick={()=>navigate("/enquiry")} className="w-full sm:w-auto bg-[#0E9F6E] hover:bg-[#0c865c] text-white px-6 py-3 rounded-lg shadow transition font-semibold">
//                 Order Now
//               </button>
//               {/* <button className="w-full sm:w-auto border border-[#0E9F6E] text-[#0E9F6E] hover:bg-[#f0fdf8] px-6 py-3 rounded-lg transition font-semibold">
//                 Add to Wishlist
//               </button> */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductItemDetail;


 

const products = [
  {
    categorySlug: "kalanamak",
    itemSlug: "kalanamak-rice",
    name: "Kalanamak Rice",
    alternateName: "Buddha Rice",
    description:
      "Kalanamak rice, a renowned aromatic variety from the Himalayan Terai, is celebrated for its texture and aroma, with roots tracing back to Gautam Buddha.",
    placeOfOrigin: "Siddharthnagar, Uttar Pradesh",
    giTagNumber: "205",
    grade: "Dwarf Variety",
    packingType: "PP Bag – 50kg",
    availableQuantity: "50 MT",
    minOrderQuantity: "1 MT",
    cropSeason: "Dec-2023",
    totalFarmers: 200,
    stockStatus: "Available",
    price: "₹ 2000 / Quintal",
    paymentTerms: ["Cash Advance (CA)", "Cash in Advance (CID)"],
    samplePolicy:
      "Product Costs, Shipment, and Tax have to be paid by the buyer",
    image: "/images/sample-crop.jpg",
  },
  {
    categorySlug: "foxnut",
    itemSlug: "phool-makhana",
    name: "Phool Makhana",
    alternateName: "Fox Nut",
    description:
      "Phool Makhana from Mithila, Bihar is revered for its Ayurvedic and nutritional value, harvested fresh from local wetlands and carrying a GI tag.",
    placeOfOrigin: "Madhubani, Darbhanga, Bihar",
    giTagNumber: "696",
    packingType: "PP Bag – 10kg / Jute Bag – 8 kg",
    availableQuantity: "50 MT",
    minOrderQuantity: "200 Kg",
    cropSeason: "Aug-Sep 2023",
    totalFarmers: 200,
    stockStatus: "Available",
    price: "₹ 2000 / Quintal",
    paymentTerms: ["Cash Advance (CA)", "Cash in Advance (CID)"],
    samplePolicy:
      "Product Costs, Shipment, and Tax have to be paid by the buyer",
    image: "/images/sample-crop.jpg",
  },
];

import { useNavigate, useParams } from "react-router-dom";

const ProductItemDetail = () => {
  const { categorySlug, itemSlug } = useParams();
  const navigate = useNavigate();

  const item = products.find(
    (p) => p.categorySlug === categorySlug  
  );
// console.log("Item coming is ",item)
  if (!item) {
    return <div className="p-6 text-red-500">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f0fff4] to-[#e6fff8] p-4 sm:p-6">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 pt-6">
          <button
            onClick={() => navigate(`/product-category/${categorySlug}`)}
            className="text-gray-500 hover:text-[#0E9F6E] transition font-medium"
          >
            ← Back
          </button>
          <span className="text-sm font-medium text-gray-400 capitalize">
            Category: {categorySlug.replace(/-/g, " ")}
          </span>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 sm:p-10">
          {/* Image Section */}
          <div className="flex justify-center items-center">
            <img
              src={item.image}
              alt={item.name}
              className="rounded-xl shadow-md w-full h-[350px] object-cover max-w-xl"
            />
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E9F6E] capitalize mb-6">
              {item.name}
            </h1>

            <div className="space-y-4 text-gray-700 text-base leading-relaxed">
              <p>
                <strong>Description:</strong> {item.description}
              </p>
              <p>
                <strong>Place of Origin:</strong> {item.placeOfOrigin}
              </p>
              <p>
                <strong>GI Tag:</strong> {item.giTagNumber}
              </p>
              <p>
                <strong>Packing:</strong> {item.packingType}
              </p>
              <p>
                <strong>Available Quantity:</strong> {item.availableQuantity}
              </p>
              <p>
                <strong>Minimum Order:</strong> {item.minOrderQuantity}
              </p>
              <p>
                <strong>Crop Season:</strong> {item.cropSeason}
              </p>
              <p>
                <strong>Farmers Involved:</strong> {item.totalFarmers}
              </p>
              <p>
                <strong>Stock Status:</strong> {item.stockStatus}
              </p>
              <p>
                <strong>Price:</strong>{" "}
                <span className="text-[#0E9F6E] font-semibold">{item.price}</span>
              </p>
              <p>
                <strong>Payment Terms:</strong> {item.paymentTerms.join(", ")}
              </p>
              <p>
                <strong>Sample Policy:</strong> {item.samplePolicy}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/enquiry")}
                className="w-full sm:w-auto bg-[#0E9F6E] hover:bg-[#0c865c] text-white px-6 py-3 rounded-lg shadow transition font-semibold"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItemDetail;

