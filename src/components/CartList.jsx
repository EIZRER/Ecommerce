import { useRequest } from "ahooks";
import Cart from "./Cart";
import { useContext, useState, useEffect } from "react";
import { ApplicationContext } from "./Layout";
import { useUser, useClerk } from "@clerk/clerk-react";
import { SignInButton } from "@clerk/clerk-react";
import PropTypes from "prop-types";

function Product({ id, quantity, onRemove, onQuantityChange }) {
  const { data } = useRequest(() =>
    fetch(`https://dummyjson.com/products/${id}`).then((res) => res.json())
  );

  return (
    <>
      {data && (
        <Cart
          id={id}
          name={data.title}
          price={data.price}
          url={data.images[0]}
          quantity={quantity}
          onRemove={onRemove}
          onQuantityChange={onQuantityChange}
        />
      )}
    </>
  );
}

Product.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  quantity: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  onQuantityChange: PropTypes.func.isRequired,
};

export default function CartList() {
  const { basket, setBasket } = useContext(ApplicationContext);
  const { isSignedIn, user } = useUser();
  const { user: clerkUser } = useClerk();
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (isSignedIn && user?.metadata?.cart) {
      setBasket(user.metadata.cart);
    }
  }, [isSignedIn, user, setBasket]);

  const calculateTotal = () => {
    return basket.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handlePurchase = async () => {
    if (basket.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setIsPurchasing(true);

      const purchaseHistory = {
        date: new Date().toISOString(),
        items: basket.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          url: item.url,
        })),
        total: calculateTotal(),
      };

      const currentPurchases = user?.metadata?.purchases || [];

      await clerkUser.setMetadata({
        purchases: [...currentPurchases, purchaseHistory],
        cart: [], // Clear the cart
      });

      setBasket([]);
      alert(
        `Thank you for your purchase, ${user.firstName}! Your order has been confirmed.`
      );
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Failed to process your purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const newBasket = basket.filter((item) => item.id !== id);
      setBasket(newBasket);

      if (isSignedIn) {
        await clerkUser.setMetadata({
          ...user.metadata,
          cart: newBasket,
        });
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleQuantityChange = async (id, change) => {
    try {
      const newBasket = basket.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      setBasket(newBasket);

      if (isSignedIn) {
        await clerkUser.setMetadata({
          ...user.metadata,
          cart: newBasket,
        });
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-8">
            <i className="fas fa-lock text-6xl text-blue-500"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to view your cart
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in or create an account to access your shopping cart.
          </p>
          <SignInButton mode="modal">
            <button className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      {basket.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-600">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mt-2">Add some items to get started!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            {basket.map(({ id, quantity }) => (
              <Product
                key={id}
                id={id}
                quantity={quantity}
                onRemove={handleRemove}
                onQuantityChange={(change) => handleQuantityChange(id, change)}
              />
            ))}
          </div>

          {/* Purchase Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Subtotal:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Shipping:</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className={`w-full py-4 px-6 rounded-lg font-medium text-white 
                  ${
                    isPurchasing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } 
                  transition-colors duration-300`}
              >
                {isPurchasing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Complete Purchase"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
