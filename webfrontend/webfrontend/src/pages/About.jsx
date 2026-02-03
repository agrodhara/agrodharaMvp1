import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#E6FFFA] to-[#F0F9FF] flex items-center justify-center px-6 py-16">
      <div className="  bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-10">
        {/* Header */}
        <h1
          className="text-4xl font-extrabold text-center text-[#0E9F6E] mb-6"
        >
          About Us
        </h1>

        {/* Description */}
        <p
          className="text-lg text-gray-700 leading-relaxed text-justify"
        >
          <span className="font-semibold text-[#0E9F6E]">AgroDhara Private Limited</span> is a purpose-driven agri-tech company working at the intersection of technology, sustainability, and rural empowerment. We collaborate directly with <span className="font-medium text-gray-900">Farmer Producer Organizations (FPOs)</span> to streamline the aggregation, procurement, and sale of agricultural produce.
          <br /><br />
          Our platform is designed to reduce inefficiencies in the supply chain, increase farmer incomes, and ensure high-quality produce reaches large institutional buyers. With a strong foundation in <span className="text-blue-600 font-medium">data intelligence, climate-smart practices,</span> and transparent sourcing, AgroDhara aims to build a future-ready agriculture ecosystem that benefits every stakeholder — from the farm to the final consumer.
        </p>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition"
          >
            <h3 className="text-2xl font-semibold text-[#0E9F6E] mb-4">Technology Integration</h3>
            <p className="text-gray-600 text-base">
              We leverage cutting-edge technology to optimize the agricultural supply chain, reducing waste and ensuring quality at every step.
            </p>
          </div>

          <div
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition"
          >
            <h3 className="text-2xl font-semibold text-[#0E9F6E] mb-4">Sustainability Focus</h3>
            <p className="text-gray-600 text-base">
              Our practices are designed to support long-term environmental sustainability, ensuring that agriculture thrives for generations to come.
            </p>
          </div>

          <div
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition"
          >
            <h3 className="text-2xl font-semibold text-[#0E9F6E] mb-4">Farmer Empowerment</h3>
            <p className="text-gray-600 text-base">
              We empower farmers by offering them better access to markets, technology, and fair pricing, improving their livelihoods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
