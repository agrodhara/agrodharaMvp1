import { useParams } from "react-router-dom";
import CropCard from "../components/cards/CropCard";
const categoryData = {
  en: {
    foxnut: [
      {
        id: 1,
        title: "Suta 3-4 (9-12.5mm)",
        image: "/foxnut.jpg",
        quantity: "1kg",
        price: 450,
        originalPrice: 1400
      },
      {
        id: 2,
        title: "Suta 4-5 (12.5-15.5mm)",
        image: "/foxnut.jpg",
        quantity: "1kg",
        price: 500,
        originalPrice: 1500
      },
      {
        id: 3,
        title: "Suta 4+ (Multi-Size) (12.5-24mm)",
        image: "/foxnut.jpg",
        quantity: "1kg",
        price: 480,
        originalPrice: 1400
      },
      {
        id: 4,
        title: "Suta 5-6 Pure/HP (15.7-19mm)",
        image: "/images/foxnut/suta-5-6.jpg",
        quantity: "1kg",
        price: 550,
        originalPrice: 1500
      },
      {
        id: 5,
        title: "Suta 5+ Non-HP (15.75-24mm)",
        image: "/foxnut.jpg",
        quantity: "1kg",
        price: 520,
        originalPrice: 1500
      },
      {
        id: 6,
        title: "Suta 5+ HP (15.75-24mm)",
        image: "/foxnut.jpg",
        quantity: "1kg",
        price: 570,
        originalPrice: 1500
      },
      {
        id: 7,
        title: "Suta 6+ Non-HP (19-24mm)",
        image: "/foxnut.jpg",
        quantity: "1kg",
        price: 590,
        originalPrice: 1500
      },
      {
        id: 8,
        title: "Suta 6+ HP (19-24mm)",
        image: "/foxnut.jpg",
        quantity: "1kg",
        price: 620,
        originalPrice: 1600
      }
    ],
    kalanamak: [
      {
        id: 9,
        title: "KN3",
        image: "/kalanamak.png",
        quantity: "5kg",
        price: 800,
        originalPrice: 1800
      },
      {
        id: 10,
        title: "KN 207",
        image: "/kalanamak.png",
        quantity: "5kg",
        price: 850,
        originalPrice: 1800
      },
      {
        id: 11,
        title: "KN 208",
        image: "/kalanamak.png",
        quantity: "5kg",
        price: 820,
        originalPrice: 1800
      },
      {
        id: 12,
        title: "KN 209",
        image: "/kalanamak.png",
        quantity: "5kg",
        price: 870,
        originalPrice: 1800
      },
      {
        id: 13,
        title: "PUSA 1638",
        image: "/kalanamak.png",
        quantity: "5kg",
        price: 900,
        originalPrice: 1900
      },
      {
        id: 14,
        title: "PUSA 1652",
        image: "/kalanamak.png",
        quantity: "5kg",
        price: 920,
        originalPrice: 1900
      },
      {
        id: 15,
        title: "KIRAN",
        image: "/kalanamak.png",
        quantity: "5kg",
        price: 950,
        originalPrice: 1900
      }
    ]
  }
};


const ProductCategoryDetails = () => {
  const { categorySlug } = useParams();
  // Convert slug back to title
  const formattedCategory = categorySlug.replace(/-/g, " ").toLowerCase();

  // Find the matching key
  const matchingCategory = Object.keys(categoryData.en).find(key => 
    key.toLowerCase() === formattedCategory
  );

  const items = matchingCategory ? categoryData.en[matchingCategory] : [];

  return (
       <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Category: {matchingCategory || "Not Found"}</h2>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, index) => (
  <CropCard
    key={index}

    id={item.id}
    title={item.title}
    image={item.image}
    quantity={item.quantity}
    price={item.price}
    quantityOptions={[1, 10,100]}
    originalPrice={item.originalPrice}
  />
))}

        </div>
      ) : (
        <p>No items available for this category.</p>
      )}
    </div>
  );
};

export default ProductCategoryDetails;

 