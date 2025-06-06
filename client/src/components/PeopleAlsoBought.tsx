import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axiosInstance from "../lib/axios";
import {isAxiosError} from "axios"
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { IProduct } from "../lib/interfaces";

const PeopleAlsoBought = () => {
	const [recommendations, setRecommendations] = useState<IProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchRecommendations = async () => {
			try {
				const res = await axiosInstance.get("/products/recommendations");
				setRecommendations(res.data.products);
			} catch (error) {
				if (isAxiosError(error)) {
					toast.error(error.response?.data.message || "An error occurred while fetching recommendations");
				} else {
					toast.error("An unexpected error occurred");
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecommendations();
	}, []);

  console.log("Recommendations:", recommendations);

	if (isLoading) return <LoadingSpinner />;

	return (
		<div className='mt-8'>
			<h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3>
			<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{recommendations.map((product) => (
					<ProductCard key={product._id} product={product} />
				))}
			</div>
		</div>
	);
};

export default PeopleAlsoBought;
