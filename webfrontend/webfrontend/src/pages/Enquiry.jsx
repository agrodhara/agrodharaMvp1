import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const categoryData = {
  en: {
    foxnut: [
      { id: 1, title: "Suta 3-4 (9-12.5mm)" },
      { id: 2, title: "Suta 4-5 (12.5-15.5mm)" },
      { id: 3, title: "Suta 4+ (Multi-Size) (12.5-24mm)" },
      { id: 4, title: "Suta 5-6 Pure/HP (15.7-19mm)" },
      { id: 5, title: "Suta 5+ Non-HP (15.75-24mm)" },
      { id: 6, title: "Suta 5+ HP (15.75-24mm)" },
      { id: 7, title: "Suta 6+ Non-HP (19-24mm)" },
      { id: 8, title: "Suta 6+ HP (19-24mm)" },
    ],
    kalanamak: [
      { id: 101, title: "Long Variety" },
      { id: 102, title: "Dwarf Variety" }
    ]
  }
};

const BulkEnquiryForm = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSubVarieties, setSelectedSubVarieties] = useState({});
  const [varietyQuantities, setVarietyQuantities] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const inputStyle = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F6E]';

  const handleProductChange = (product) => {
    setSelectedProducts((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    );
    setSelectedSubVarieties((prev) => ({ ...prev, [product]: [] }));
  };

  const handleSubVarietyChange = (subVariety, product) => {
    setSelectedSubVarieties((prev) => {
      const updated = { ...prev };
      if (updated[product]?.includes(subVariety)) {
        updated[product] = updated[product].filter(item => item !== subVariety);
      } else {
        updated[product] = [...(updated[product] || []), subVariety];
      }
      return updated;
    });
  };

  const handleQuantityChange = (variety, value) => {
    setVarietyQuantities((prev) => ({
      ...prev,
      [variety]: value,
    }));
  };

  const renderSubVarieties = (product) => {
    const data = categoryData.en[product];
    return data.map((item) => {
      const isChecked = selectedSubVarieties[product]?.includes(item.title);
      return (
        <div key={item.id} className="mb-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              value={item.title}
              checked={isChecked}
              onChange={() => handleSubVarietyChange(item.title, product)}
            />
            {item.title}
          </label>
          {isChecked && (
            <input
              type="number"
              min="0"
              placeholder="Quantity (MT)"
              value={varietyQuantities[item.title] || ''}
              onChange={(e) => handleQuantityChange(item.title, e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          )}
        </div>
      );
    });
  };

  const onSubmit = (data) => {
    const enquiryData = {
      ...data,
      selectedProducts,
      selectedSubVarieties,
      varietyQuantities,
    };
    console.log('Submitting Enquiry:', enquiryData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-6 mt-10">
      <h2 className="text-2xl font-bold text-center text-[#0E9F6E]">Bulk Enquiry Form</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label>
          Company Name:
          <input {...register('companyName')} className={inputStyle} />
        </label>
        <label>
          Contact Person:<span className="text-red-500 ml-1">*</span>
          <input {...register('contactPerson', { required: 'Contact Person is required' })} className={inputStyle} />
          {errors.contactPerson && <p className="text-red-500 text-sm">{errors.contactPerson.message}</p>}
        </label>
        <label>
          Position:
          <input {...register('position')} className={inputStyle} />
        </label>
        <label>
          Email Address:<span className="text-red-500 ml-1">*</span>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            className={inputStyle}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </label>
        <label>
          Phone Number:<span className="text-red-500 ml-1">*</span>
          <input {...register('phone', { required: 'Phone number is required' })} className={inputStyle} />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </label>
        <label>
          Country:<span className="text-red-500 ml-1">*</span>
          <input {...register('country', { required: 'Country is required' })} className={inputStyle} />
          {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
        </label>
      </div>

      <fieldset>
        <legend className="font-semibold">Select Product(s):</legend>
        <div className="flex flex-row gap-4 mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              value="kalanamak"
              checked={selectedProducts.includes('kalanamak')}
              onChange={() => handleProductChange('kalanamak')}
              className="mr-2"
            />
            Kalanamak Rice
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              value="foxnut"
              checked={selectedProducts.includes('foxnut')}
              onChange={() => handleProductChange('foxnut')}
              className="mr-2"
            />
            Makhana/Foxnut
          </label>
        </div>
      </fieldset>

      <div className="flex flex-col md:flex-row gap-10">
        {selectedProducts.includes('kalanamak') && (
          <fieldset className="flex-1">
            <legend className="font-semibold mt-4">Select Kalanamak Variety:</legend>
            <div className="flex flex-col gap-2 mt-2">
              {renderSubVarieties('kalanamak')}
            </div>
          </fieldset>
        )}
        {selectedProducts.includes('foxnut') && (
          <fieldset className="flex-1">
            <legend className="font-semibold mt-4">Select Makhana Variety:</legend>
            <div className="flex flex-col gap-2 mt-2">
              {renderSubVarieties('foxnut')}
            </div>
          </fieldset>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label>
          Expected Price (per Kg):
          <input type="number" {...register('price')} className={inputStyle} />
        </label>
        <label>
          Preferred Packaging:
          <input type="text" {...register('packaging')} className={inputStyle} />
        </label>
        <label>
          Delivery Destination:
          <input type="text" {...register('destination')} className={inputStyle} />
        </label>
        <label>
          Preferred Delivery Date:
          <input type="date" {...register('deliveryDate')} className={inputStyle} />
        </label>
      </div>

      <div className="pt-6 text-center">
        <button
          type="submit"
          className="bg-[#0E9F6E] hover:bg-[#0c865c] text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          Submit Enquiry
        </button>
      </div>
    </form>
  );
};

export default BulkEnquiryForm;
