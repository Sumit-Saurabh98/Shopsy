
import { useOrderStore } from "../stores/useOrderStore";
import LoadingSpinner from "./LoadingSpinner";

const OrdersTab = () => {
  const { allOrder, loadingAllOrder, orderStatusChanged } = useOrderStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400 text-black";
      case "accepted":
        return "bg-green-500 text-white";
      case "shipped":
        return "bg-blue-500 text-white";
      case "delivered":
        return "bg-green-800 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-black";
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await orderStatusChanged(orderId, newStatus);
  };

  return (
    <div className="p-4">
      {loadingAllOrder && <LoadingSpinner />}
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-400">
        All Orders
      </h1>
      {allOrder.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-emerald-400">
            <thead>
              <tr className="bg-emerald-900">
                <th className="border border-emerald-400 px-4 py-3 text-left text-emerald-100">
                  Order ID
                </th>
                <th className="border border-emerald-400 px-4 py-3 text-left text-emerald-100">
                  Customer Name
                </th>
                <th className="border border-emerald-400 px-4 py-3 text-left text-emerald-100">
                  Customer Email
                </th>
                <th className="border border-emerald-400 px-4 py-3 text-left text-emerald-100">
                  Order Date
                </th>
                <th className="border border-emerald-400 px-4 py-3 text-left text-emerald-100">
                  Last Update
                </th>
                <th className="border border-emerald-400 px-4 py-3 text-left text-emerald-100">
                  Total Price
                </th>
                <th className="border border-emerald-400 px-4 py-3 text-left text-emerald-100">
                  Order Status
                </th>
              </tr>
            </thead>
            <tbody>
              {allOrder.map((order) => (
                <tr key={order._id} className="hover:bg-emerald-950/30">
                  <td className="border border-emerald-400 px-4 py-3 text-emerald-100">
                    {order._id.slice(-8)}
                  </td>
                  <td className="border border-emerald-400 px-4 py-3 text-emerald-100">
                    {order.userId?.name || 'N/A'}
                  </td>
                  <td className="border border-emerald-400 px-4 py-3 text-emerald-100">
                    {order.userId?.email || 'N/A'}
                  </td>
                  <td className="border border-emerald-400 px-4 py-3 text-emerald-100">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-emerald-400 px-4 py-3 text-emerald-100">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="border border-emerald-400 px-4 py-3 text-emerald-100 font-semibold">
                    ${order.totalAmount}
                  </td>
                  <td className="border border-emerald-400 px-4 py-3">
                    <select
                      className={`${getStatusColor(order.orderStatus)} px-3 py-2 rounded-md border-none outline-none cursor-pointer font-medium`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-emerald-400 text-lg">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;