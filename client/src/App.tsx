import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import Footer from "./components/Footer";
import ContactPage from "./components/ContactPage";
import AboutPage from "./components/AboutPage";
import ServicesPage from "./components/ServicesPage";
import PortfolioPage from "./components/PortfolioPage";
import OrderList from "./pages/OrderList";

function App() {
	const { checkAuth, user, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (!user) return;
		getCartItems();
	}, [getCartItems, user]);

	// Show loading spinner while checking authentication
	if (checkingAuth) {
		return (
			<div className='min-h-screen bg-gray-900 flex items-center justify-center'>
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
			{/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

			<div className='relative z-50 pt-20'>
				<Navbar />
				<Routes>
					<Route path='/' element={user ? <HomePage /> : <Navigate to='/login' replace />} />
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' replace />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' replace />} />
					<Route path='/admin-dashboard' element={user && user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' replace />} />
					<Route path='/category/:category' element={<CategoryPage />} />
					<Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' replace />} />
					<Route
						path='/purchase-success'
						element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' replace />}
					/>
					<Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' replace />} />
					<Route path='/order-list' element={user ? <OrderList /> : <Navigate to='/login' replace />} />
					<Route path='/contact' element={<ContactPage />} />
					<Route path='/about' element={<AboutPage />} />
					<Route path='/services' element={<ServicesPage />} />
					<Route path='/portfolio' element={<PortfolioPage />} />
					
					{/* Catch-all route for 404 */}
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
				<Footer />
			</div>
			<Toaster />
		</div>
	);
}

export default App;