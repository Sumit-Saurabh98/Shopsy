import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import ProcessingPaymentSpinner from "../components/ProcessingPaymentSpinner";
import FailedPayment from "../components/FailedPayment";

// Define types for better type safety
interface OrderDetails {
    success: boolean;
    message: string;
    orderId: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const PurchaseSuccessPage: React.FC = () => {
	const [isProcessing, setIsProcessing] = useState<boolean>(true);
	const { clearCart } = useCartStore();
	const [error, setError] = useState<string | null>(null);
	const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

	useEffect(() => {
		const handleCheckoutSuccess = async (sessionId: string): Promise<void> => {
			try {
				
				const response = await axios.post<OrderDetails>("/payments/checkout-success", {
					sessionId,
				});
				
				if (response.data.success) {
					setOrderDetails(response.data);
					clearCart();
				} else {
					throw new Error(response.data.message || "Payment processing failed");
				}
			} catch (error: unknown) {
				console.error("Checkout success error:", error);
				
				const apiError = error as ApiError;
				
				// More detailed error handling
				if (apiError.response?.data?.message) {
					setError(apiError.response.data.message);
				} else if (apiError.message) {
					setError(apiError.message);
				} else {
					setError("An unexpected error occurred during payment processing");
				}
			} finally {
				setIsProcessing(false);
			}
		};

		const sessionId: string | null = new URLSearchParams(window.location.search).get("session_id");
		
		if (sessionId) {
			handleCheckoutSuccess(sessionId);
		} else {
			setIsProcessing(false);
			setError("No session ID found in the URL");
		}
	}, [clearCart]);

	if (isProcessing) return <ProcessingPaymentSpinner />;

	if (error) {
		console.log("Rendering error page with error:", error);
		return <FailedPayment />;
	}

	return (
		<div className='h-screen flex items-center justify-center px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
						Purchase Successful!
					</h1>

					<p className='text-gray-300 text-center mb-2'>
						Thank you for your order. {"We're"} processing it now.
					</p>
					<p className='text-emerald-400 text-center text-sm mb-6'>
						Check your email for order details and updates.
					</p>
					<div className='bg-gray-700 rounded-lg p-4 mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-400'>Order number</span>
							<span className='text-sm font-semibold text-emerald-400'>
								#{orderDetails?.orderId?.toString().slice(-8) || '12345'}
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-gray-400'>Estimated delivery</span>
							<span className='text-sm font-semibold text-emerald-400'>3-5 business days</span>
						</div>
					</div>

					<div className='space-y-4'>
						<button
							className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center'
						>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PurchaseSuccessPage;