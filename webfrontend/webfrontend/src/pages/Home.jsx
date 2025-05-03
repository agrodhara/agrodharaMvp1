import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  return (
   <div>
    {/* <Navbar/> */}
     <div className="relative w-full h-screen">
 
 <img
   src="/farmerHomepage.png"
   alt="Farmer"
   className="absolute inset-0 w-full h-full object-cover rounded-lg"
 />

 {/* Overlay (Optional, for dimming effect) */}
 <div className="absolute inset-0 bg-black opacity-10 rounded-lg" />

 {/* Content */}
 <div className="relative z-10 flex flex-col justify-center h-full  ml-10 mx-auto">
   <div className="max-w-xl space-y-6">
     <h1 className="text-5xl md:text-6xl  leading-tight text-white">
       Transforming <span className="text-white font-extrabold">Agriculture</span>,<br />
       Empowering <span className="text-white font-extrabold">Communities</span>.
     </h1>
     <p className="text-lg text-white">
       A digital bridge between Farmer Producer Organizations and institutional buyers — powered by technology, driven by trust.
     </p>
     <button className="bg-white text-black px-6 py-3 rounded-3xl text-sm font-semibold hover:bg-gray-800 transition">
       DISCOVER
     </button>
   </div>
 </div>
 <div className="w-full my-32 border  p-4">
 <div className="grid grid-cols-3 items-center gap-4">
   
   {/* Left: Heading */}
   <div className="flex justify-center">
     <h2 className="text-4xl font-extrabold text-black text-center">
       WHO ARE WE?
     </h2>
   </div>

   {/* Middle: Image */}
   <div className="flex justify-center">
     <img
       src="/vegbag.png" // replace with your image path
       alt="Vegetables Bag"
       className="h-48 object-contain"
     />
   </div>

   {/* Right: Text */}
   <div className="text-justify text-black ">
     <p>
       AgroDhara is a tech-powered agri-commerce platform that connects Farmer Producer Organizations (FPOs) directly with institutional buyers. We solve supply chain inefficiencies by aggregating quality produce, offering real-time visibility, and enabling digital transactions — all on one unified platform. Our aim is to build a transparent, sustainable, and scalable agri-marketplace that empowers farmers and brings traceability to the food supply chain.
     </p>
   </div>

 </div>
</div>
<div className=' flex justify-center'>
 <img src="/enhancingEfficiency.png" className='w-[80vw]' alt="" />
</div>


<div className="w-full my-20 border p-6">
 <div className="grid grid-cols-2 gap-8 ">
   
   
   <div className=" flex justify-center ">
    <div className='space-y-6 w-[35vw]'>
    <div>
       <h2 className="text-3xl font-extrabold text-black">OUR FOCUSED</h2>
       <h3 className="text-2xl font-light text-gray-700">COMMODITIES</h3>
     </div>
     <p className="text-gray-600">
       Sourced Directly from farms, sorted & graded with care and, Finally, Delivered across PAN India with complete control over quality.
     </p>
     <button onClick={()=>navigate("/enquiry")} className="border-2 border-black text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition">
       ORDER NOW
     </button>
    </div>
   </div>

   <div>
     <div className="grid grid-cols-2 gap-4">
       
       <div onClick={()=>navigate("/product-category/kalanamak")} className="cursor-pointer relative rounded-lg overflow-hidden">
         <img
           src="/kalanamak.png"  
           alt="Kalanamak Rice"
           className="w-full h-48 object-cover"
         />
         <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
           <h4 className="text-white text-lg font-bold text-center">
             KALANAMAK<br />RICE
           </h4>
         </div>
       </div>

       <div  onClick={()=>navigate("/product-category/foxnut")} className="cursor-pointer relative rounded-lg overflow-hidden">
         <img
           src="/foxnut.jpg" 
           alt="Fox Nuts"
           className="w-full h-48 object-cover"
         />
         <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
           <h4 className="text-white text-lg font-bold text-center">
             FOX<br />NUTS
           </h4>
         </div>
       </div>

     </div>

     
     <p className="text-gray-500 text-sm mt-2 text-center">And more to come...</p>
   </div>

 </div>
</div>
<div className="w-full flex  max-w-6xl    p-8">
 <div className=" flex gap-5 ">
   
   {/* Quote Icon */}
   <div>
     <img src="/doublequotes.png" alt="" />
   </div>

  <div className='max-w-4xl '>
    {/* Testimonial Text */}
    <p className="italic text-gray-700 text-lg leading-relaxed">
     I have been with them since 1 years, my business has grown multifold. Initially I was dispatching 10 vehicles a day, from past 6 months the count has gone up to 15 vehicles a day.
     The demand is constant and payment are on time. Overall I had a great experience.
   </p>

   {/* Author */}
   <p className="font-bold text-gray-800 mt-6">
     -- Makhana FPO Parner, Maharastra
   </p>
  </div>

 </div>
</div>
{/* ================================== */}
<div className="w-full bg-gray-200 py-12 flex justify-center">
 <form className="w-full max-w-2xl px-4">
   
   {/* Name and Email */}
   <div className="flex flex-col md:flex-row gap-4 mb-6">
     <input
       type="text"
       placeholder="Name"
       className="w-full bg-transparent border-b border-gray-500 placeholder-gray-400 focus:outline-none   py-2"
     />
     <input
       type="email"
       placeholder="E-mail"
       className="w-full bg-transparent border-b border-gray-500  focus:outline-none py-2"
     />
   </div>

   {/* Comments */}
   <div className="mb-6">
     <textarea
       placeholder="Comments"
       className="w-full bg-transparent border-b border-gray-500  focus:outline-none py-2 resize-none"
     />
   </div>

   {/* Horizontal Line */}
   {/* <div className="border-t border-gray-500 "></div> */}

   {/* Send Button */}
   <div className="flex justify-end">
     <button
       type="submit"
       className="px-8 py-2 border border-gray-500 font-bold  rounded-full hover:bg-gray-500 transition-colors text-sm tracking-widest"
     >
       SEND
     </button>
   </div>

 </form>
</div>


<div className="w-full mb-40 bg-white py-12 px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-10">

 {/* Left Side */}
 <div className="flex items-center gap-6">
   <img src="/logo.png" alt="Agrodhara Logo" className="w-24 h-auto" />
   <div className="flex flex-col items-start text-left space-y-2">
     <p className="text-gray-700">
       70/21 Pramod Apartment, Pimpri Chinchwad, Pune 411033
     </p>
     <p className="text-gray-700">
       +91 98902 XXXXX / +91 8600 XXXXX
     </p>
     <a href="mailto:info@agrodhara.com" className="text-blue-600 underline">
       info@agrodhara.com
     </a>
   </div>
 </div>

 {/* Right Side */}
 <div className="flex flex-col items-center md:items-end text-center md:text-right">
   <h2 className="font-bold text-lg mb-4">GET A NEWSLETTER</h2>
   <div className="flex flex-col md:flex-row items-center gap-4">
     <input
       type="email"
       placeholder="Your E-mail"
       className="border-b border-gray-300 bg-transparent focus:outline-none text-gray-800 py-2 w-64"
     />
     <button
       type="submit"
       className="px-6 py-2 border border-blue-700 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition-colors font-semibold text-sm"
     >
       SUBSCRIBE
     </button>
   </div>
 </div>

</div>





</div>
   </div>

  )
}

export default Home
