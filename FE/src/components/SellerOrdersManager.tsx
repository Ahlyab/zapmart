import React, { useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import axios from "axios";

interface OrderItem {
  id: string;
  product?: { name?: string };
  price: number;
  quantity: number;
  weight: number;
}
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  user?: { id?: string; name?: string; email?: string };
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: {
    street?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  deliveryPartner?: string;
}

type SellerOrdersManagerProps = {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
};

const SellerOrdersManager: React.FC<SellerOrdersManagerProps> = ({
  orders,
  setOrders,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold mb-6">Manage Orders</h2>
    {orders.length === 0 ? (
      <div className="text-center text-gray-500">
        No orders found for your products.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2">Order #</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Shipping</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Product Name(s)</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Tracking</th>
              <th className="px-4 py-2">Delivery Partner</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const uniqueProductNames = Array.from(
                new Set(order.items.map((item) => item?.product?.name))
              );
              return (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">
                    {order.id.slice(-8)}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {order.user?.name || order.customerName || "-"}
                    <br />
                    <span className="text-xs text-gray-500">
                      {order.user?.email || order.customerEmail || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {order.shippingAddress?.street ||
                      order.shippingAddress?.address ||
                      "-"}
                    <br />
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.country}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.product?.name || "-"} x{item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-xs font-medium">
                    {uniqueProductNames.join(", ")}
                  </td>
                  <td className="px-4 py-2 font-bold">{order.status}</td>
                  <td className="px-4 py-2 text-xs">
                    {order.trackingNumber || "-"}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {order.deliveryPartner || "-"}
                  </td>
                  <td className="px-4 py-2">
                    <OrderStatusActions
                      order={order}
                      onUpdate={(updated) => {
                        setOrders((ord) =>
                          ord.map((o) =>
                            o.id === order.id ? { ...o, ...updated } : o
                          )
                        );
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// --- OrderStatusActions ---
interface SellerOrderType extends Order {
  paymentIntentId?: string;
}
function OrderStatusActions({
  order,
  onUpdate,
}: {
  order: SellerOrderType;
  onUpdate: (update: Partial<SellerOrderType>) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  const [deliveryPartner, setDeliveryPartner] = useState(
    order.deliveryPartner || ""
  );
  // Treat 'pending' and 'paid' as actionable for preparing
  const canPrepare = order.status === "paid" || order.status === "pending";
  const canHandToDelivery = order.status === "preparing";

  const update = async (status: string) => {
    setUpdating(true);
    try {
      const url = `${API_ENDPOINTS.SELLER_ORDER_STATUS_UPDATE}/${order.id}/status`;
      const payload: {
        status: string;
        trackingNumber?: string;
        deliveryPartner?: string;
      } = { status };
      if (status === "handed to delivery partner") {
        payload.trackingNumber = tracking;
        payload.deliveryPartner = deliveryPartner;
      }
      await axios.put(url, payload);
      onUpdate({
        status,
        trackingNumber: payload.trackingNumber,
        deliveryPartner: payload.deliveryPartner,
      });
    } catch {
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };
  if (canPrepare) {
    return (
      <button
        onClick={() => update("preparing")}
        disabled={updating}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
      >
        Mark Preparing
      </button>
    );
  }
  if (canHandToDelivery) {
    return (
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking ID"
          className="border px-2 py-1 rounded text-xs mb-1"
        />
        <input
          type="text"
          value={deliveryPartner}
          onChange={(e) => setDeliveryPartner(e.target.value)}
          placeholder="Delivery Partner (e.g., DHL)"
          className="border px-2 py-1 rounded text-xs mb-1"
        />
        <button
          onClick={() => update("handed to delivery partner")}
          disabled={updating || !tracking.trim() || !deliveryPartner.trim()}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
        >
          Hand to Delivery Partner
        </button>
      </div>
    );
  }
  return (
    <button
      disabled
      className="bg-gray-300 text-gray-500 px-2 py-1 rounded text-xs cursor-not-allowed"
      title="No further status changes allowed"
    >
      Status Locked
    </button>
  );
}

export default SellerOrdersManager;
