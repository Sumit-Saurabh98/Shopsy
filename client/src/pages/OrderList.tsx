import LoadingSpinner from "../components/LoadingSpinner";
import { useOrderStore } from "../stores/useOrderStore";
import { motion } from "framer-motion";
import { useEffect } from "react";

const OrderList = () => {
  const { customerOrder, loadingCustomerOrder, fetchCustomerOrder } = useOrderStore();

  // Fetch orders on component mount and set up polling for real-time updates
  useEffect(() => {
    fetchCustomerOrder();
    
    // Optional: Set up polling to refresh orders every 30 seconds
    const interval = setInterval(() => {
      fetchCustomerOrder();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCustomerOrder]);

  // Function to determine the status circle color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-blue-500";
      case "shipped":
        return "bg-orange-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Function to determine the status text color
  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-400";
      case "accepted":
        return "text-blue-400";
      case "shipped":
        return "text-orange-400";
      case "delivered":
        return "text-green-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingCustomerOrder) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-400">
        Order History
      </h1>
      
      {customerOrder && customerOrder.length > 0 ? (
        <div className="space-y-6">
          {customerOrder.map((order) => (
            <motion.div
              key={order._id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg transition-transform transform hover:scale-[1.02]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-emerald-400">
                  <span className="text-gray-300">Order ID:</span> {order._id}
                </h2>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
                      order.orderStatus
                    )}`}
                  ></div>
                  <span className={`font-semibold ${getStatusTextColor(order.orderStatus)}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4 mb-4">
                {order.products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center border-b border-gray-700 pb-4 last:border-b-0"
                  >
                    <img
                      src={product.productId.image}
                      alt={product.productId.name}
                      className="w-20 h-20 object-cover rounded-md shadow-md mr-4 flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <p className="text-lg font-semibold text-gray-200">
                        {product.productId.name}
                      </p>
                      <p className="text-gray-400">Quantity: {product.quantity}</p>
                      <p className="text-emerald-400 font-semibold">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-gray-200">Total Amount:</span>
                  <span className="text-xl font-bold text-emerald-400">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    <span className="font-medium">Ordered:</span> {formatDate(order.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Last Updated:</span> {formatDate(order.updatedAt)}
                  </p>
                  {order.stripeSessionId && (
                    <p className="text-xs">
                      <span className="font-medium">Payment ID:</span> {order.stripeSessionId.slice(-10)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📦</div>
          <p className="text-xl text-gray-400 mb-2">No orders found</p>
          <p className="text-gray-500">Your order history will appear here once you make a purchase.</p>
        </motion.div>
      )}
    </div>
  );
};

export default OrderList;