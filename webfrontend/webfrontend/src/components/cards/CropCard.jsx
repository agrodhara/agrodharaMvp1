import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const CropCard = ({ title,id, image, quantityOptions = [], price, originalPrice, subtitle }) => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [mrp,setMrp] = useState(price);
  const [selectedWeight, setSelectedWeight] = useState(quantityOptions[0] || "");

  const itemSlug = id;

  const handleAddToCart = () => {
    navigate(`/product-category/${categorySlug}/${itemSlug}`);
  };
const handleWeightChange = (e)=>{
  setSelectedWeight(e.target.value);
  setMrp(e.target.value*price);
}
  return (
    <div className="w-full max-w-xs border rounded-md p-4 shadow-md bg-white">
      {/* Image */}
      <div className="flex justify-center">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-40 object-contain mb-4"
          />
        ) : (
          <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            No Image
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-md font-bold uppercase text-gray-800 truncate">{title}</h3>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
      )}

      {/* Weight Dropdown */}
      <div className="mt-2 mb-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Weight:</label>
        <select
          value={selectedWeight}
          onChange={ handleWeightChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          {quantityOptions.map((weight, idx) => (
            <option key={idx} value={weight}>{weight}kg</option>
          ))}
        </select>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-gray-800">₹{mrp}</span>
        {originalPrice && (
          <span className="text-sm line-through text-gray-400">₹{originalPrice}</span>
        )}
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-green-600  hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
      >
        Order Now
      </button>
    </div>
  );
};

export default CropCard;
