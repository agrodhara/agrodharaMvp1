import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
// import ProductCategoryLayout from "./pages/ProductCategoryLayout";  
// import ProductCategoryDetails from "./pages/ProductCategoryDetails";  
import ProductCategoryLayout from "./pages/ProductCategoryLayout";
import ProductCategoryDetails from "./pages/ProductCategoryDetails";
import ProtectedRoute from "./routes/ProtectedRoutes";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import Enquiry from "./pages/Enquiry";
import ProductItemDetail from "./pages/ProductItemDetail";
function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/enquiry" element={<Enquiry />} />
                    {/* <Route path="/orders" element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    } /> */}
                        <Route path="/orders" element={<Orders />} />
                    <Route path="/login" element={<Login />} />

                    <Route path="/product-category" element={<ProductCategoryLayout />}>
                        <Route path=":categorySlug" element={<ProductCategoryDetails />} />
                    </Route>
                    <Route path="/product-category/:categorySlug/:itemSlug" element={<ProductItemDetail />} />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;
