import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import { TrashIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import socket from "../../helpers/socket";

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
  part?: Part[];
}

interface Part {
  id: number;
  category: string;
  value: string;
  price: number;
  isAvailable: boolean;
  quantity: number;
}

const CartScreen = () => {
  const { cart, removeFromCart, clearCart } = useCartStore(); // Zustand hook
  const navigate = useNavigate();
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  console.log("Cart state on `CartScreen` load:", cart);

  useEffect(() => {
    // Listen for product updates
    socket.on("productUpdated", (updatedProduct) => {
      let shouldRedirect = false;
      useCartStore.setState((state) => {
        const productInCart = state.cart.find((product) => product.id === updatedProduct.id);

        if (!productInCart) return {}; // No changes needed if the product is not in the cart

        // If the product has been disabled, remove it and redirect to home
        if (!updatedProduct.isAvailable) {
          alert(
            `The product "${updatedProduct.name}" is no longer available and has been removed from your cart.`
          );
          shouldRedirect = true;
          return { cart: state.cart.filter((product) => product.id !== updatedProduct.id) };
        }

        // Update only if there are changes in the name, price, or type
        if (
          productInCart.name !== updatedProduct.name ||
          productInCart.price !== updatedProduct.price ||
          productInCart.type !== updatedProduct.type
        ) {
          alert(`The product "${updatedProduct.name}" has been updated in your cart.`);
          return {
            cart: state.cart.map((product) =>
              product.id === updatedProduct.id
                ? { ...updatedProduct, parts: product.parts } // Keep existing parts
                : product
            ),
          };
        }

        return {}; // No more changes
      });
      if (shouldRedirect) {
        navigate("/bicycle-shop-frontend/");
      }
    });

    // Listen for product deletions
    socket.on("productDeleted", ({ id }) => {
      useCartStore.setState((state) => ({
        cart: state.cart.filter((product) => product.id !== id),
      }));
      alert(`The product in your cart has been removed because it is no longer available.`);
      navigate("/bicycle-shop-frontend/"); // Redirect Home
    });

    // Listen for part updates
    socket.on("partUpdated", (updatedPart) => {
      useCartStore.setState((state) => {
        let productsRemoved = 0;
        let productIdToRedirect: number | null = null;

        const updatedCart = state.cart.filter((product) => {
          if (!product.parts?.some((part) => part.id === updatedPart.id)) return true;

          // If the part has been disabled, remove the product and redirect
          if (!updatedPart.isAvailable) {
            alert(
              `The part "${updatedPart.value}" (${updatedPart.category}) is no longer available. The product has been removed from your cart.`
            );
            productsRemoved++;
            productIdToRedirect = product.id; // Save the product ID for redirection
            return false; // Remove the product from the cart
          }

          // Check if there are more products in the cart than available stock
          const countInCart = state.cart.reduce(
            (sum, prod) =>
              sum + (prod.parts?.filter((part) => part.id === updatedPart.id).length || 0),
            0
          );

          if (updatedPart.quantity < countInCart) {
            alert(
              `Stock update: The part "${updatedPart.value}" now has only ${updatedPart.quantity} left. 
               Some items in your cart will be removed to match availability.`
            );

            let partsToRemove = countInCart - updatedPart.quantity;
            const newCart = state.cart.filter((prod) => {
              if (!prod.parts?.some((part) => part.id === updatedPart.id)) return true;

              if (partsToRemove > 0) {
                productsRemoved++;
                productIdToRedirect = prod.id;
                partsToRemove--; // Remove products until stock matches availability
                return false;
              }
              return true;
            });

            alert(`Some products have been removed due to stock updates. Please review your cart.`);

            // If multiple products were removed, redirect to HOME
            if (productsRemoved > 1) {
              navigate("/bicycle-shop-frontend/");
            } else if (productIdToRedirect) {
              navigate(`/product/${productIdToRedirect}`); // Redirect to the affected product
            }

            return { cart: newCart };
          }

          // If the part is still available and within stock limits, update it in the cart
          return {
            ...product,
            parts: product.parts.map((part) => (part.id === updatedPart.id ? updatedPart : part)),
          };
        });

        return { cart: updatedCart };
      });
    });

    socket.on("partDeleted", ({ id }) => {
      const deletedPartId = Number(id);

      // Get the current state of the cart
      const { cart, removeFromCart } = useCartStore.getState();
      console.log("Current cart state:", cart);

      const affectedProducts: { product: Product; partValue: string }[] = [];

      // Find all products that contain the deleted part
      cart.forEach((product) => {
        // Find the affected part inside the product parts array
        const affectedPart = product.parts?.find((part) => part.id === deletedPartId);

        if (affectedPart) {
          affectedProducts.push({
            product, // Store the product
            partValue: affectedPart.value, // Store the part's value
          });
        }
      });

      // If no product was affected, exit early
      if (affectedProducts.length === 0) {
        console.log("No affected product found, no redirection needed.");
        return;
      }

      // Remove affected products from the cart
      affectedProducts.forEach(({ product }) => {
        removeFromCart(product.id);
      });

      // Notify detailed to the user
      alert(
        `The following products have been removed from your cart because a part is no longer available:\n\n` +
          affectedProducts.map((p) => `- ${p.product.name} (Part: ${p.partValue})`).join("\n") +
          `\n\nPlease select a new configuration.`
      );

      // Redirect: If more than one product is affected, go to Home. Otherwise, go to product details.
      if (affectedProducts.length > 1) {
        navigate("/bicycle-shop-frontend/");
      } else {
        navigate(`/product/${affectedProducts[0].product.id}`);
      }
    });

    // Cleanup events
    return () => {
      socket.off("productUpdated");
      socket.off("productDeleted");
      socket.off("partUpdated");
      socket.off("partDeleted");
    };
  }, []);

  // Calculate subtotal, IVA and total
  const subtotal = cart.reduce((sum, product) => {
    const partsTotal = product.parts?.reduce((partSum, part) => partSum + part.price, 0) || 0;
    return sum + product.price + partsTotal;
  }, 0);

  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  // Verify stock (product and parts) before proceeding to checkout
  const verifyStockBeforeCheckout = async () => {
    const { cart } = useCartStore.getState();
    let updatedCart = [...cart]; // Previous cart state
    let stockChanged = false; // Flag to track if stock has changed
    let redirectTo = null;

    // Lists to store removed products and parts
    const removedProducts: { name: string }[] = [];
    const removedParts: { part: { value: string; category: string }; product: { name: string } }[] =
      [];

    try {
      for (const item of cart) {
        let removeItem = false;

        // Verify if the product is still available
        const productResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/${item.id}`
        );
        // If isn't available, remove it from the cart
        if (!productResponse.data.isAvailable) {
          console.warn(`Product removed from cart: ${item.name}`);
          updatedCart = updatedCart.filter((p) => p.id !== item.id);
          removeItem = true;
          stockChanged = true;
          redirectTo = "/bicycle-shop-frontend/"; // Redirect to home if the product is no longer available
          removedProducts.push({ name: item.name });
          continue;
        }

        // Verify each part of the product
        for (const part of item.parts || []) {
          const partResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/parts/${part.id}`
          );
          // If the part isn't available, remove it from the product
          if (!partResponse.data.isAvailable) {
            console.warn(`Part removed from cart: ${part.value} de ${item.name}`);
            removeItem = true;
            stockChanged = true;
            redirectTo = `/product/${item.id}`; // Redirect to product details if a part is no longer available
            removedParts.push({
              part: { value: part.value, category: part.category },
              product: { name: item.name },
            });
          }
        }

        // Function to update cart data
        if (removeItem) {
          updatedCart = updatedCart.filter((p) => p.id !== item.id);
        }
      }

      // If stock has changed, update the cart state
      if (stockChanged) {
        useCartStore.setState({ cart: updatedCart });

        // Detail message for the user
        const changeDetails: string[] = [];

        if (removedProducts.length > 0) {
          removedProducts.forEach((product) => {
            changeDetails.push(`Removed product: ${product.name}`);
          });
        }

        if (removedParts.length > 0) {
          removedParts.forEach(({ part, product }) => {
            changeDetails.push(
              `Removed part: ${part.value} (${part.category}) from ${product.name}`
            );
          });
        }

        alert(
          `Your cart has been updated because some products or parts are no longer available:\n\n` +
            changeDetails.join("\n") // Show all changes to the user
        );

        if (redirectTo) {
          navigate(redirectTo); // Redirect to the specified path
        }
      }

      return !stockChanged; // If no changes can proceed to payment
    } catch (error) {
      console.error("Error verifying stock before checkout:", error);
      alert("Error verifying stock before checkout: Please try again.");
      return false;
    }
  };

  // Handle checkout ("payment") process
  const handleCheckout = async () => {
    setLoadingCheckout(true);
    const canProceed = await verifyStockBeforeCheckout(); // Verify stock before proceeding
    setLoadingCheckout(false);
    if (!canProceed) return;

    alert("Proceeding to checkout...");

    // Create custom products in the database
    try {
      const { cart } = useCartStore.getState();
      const partUsage: Record<number, number> = {}; // To count
      // Times per part
      cart.forEach((item) => {
        item.parts?.forEach((part) => {
          partUsage[part.id] = (partUsage[part.id] || 0) + 1;
        });
      });

      // Create custom product/s
      for (const item of cart) {
        // could be 1 or more than 1 products
        const productName = item.name;
        const productPrice =
          item.price + (item.parts?.reduce((sum, part) => sum + part.price, 0) || 0);
        const typeProduct = item.type;
        const partIds = item.parts?.map((part) => part.id) || [];

        // Create a custom product in the database
        const { data: customProduct } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/custom-products`,
          {
            name: productName,
            price: productPrice.toFixed(2),
            typeProduct,
            parts: partIds, // Asoociate parts with the custom product
          }
        );

        console.log("Custom Product created:", customProduct);
        socket.emit("customProductCreated", customProduct);
      }

      // Clear cart and redirect hom first
      useCartStore.setState({ cart: [] });
      alert("Order completed successfully!\nThank you for your purchase.");
      navigate("/bicycle-shop-frontend/");

      // Once redirected, update the stock
      setTimeout(async () => {
        try {
          // Get current stock
          const partStockResponses = await Promise.all(
            Object.keys(partUsage).map((partId) =>
              axios.get(`${import.meta.env.VITE_API_URL}/api/parts/${partId}`)
            )
          );

          // Mapping current stock
          const partStock: Record<number, number> = {};
          partStockResponses.forEach((response) => {
            const part = response.data;
            partStock[part.id] = part.quantity; // Save current stock of each part
          });

          // Update stock all purchase parts
          const updatePartStockPromises = Object.entries(partUsage).map(
            async ([partId, quantityUsed]) => {
              const currentStock = partStock[Number(partId)];
              const newStock = Math.max(currentStock - quantityUsed, 0); // Avoid negative numbers

              return axios.patch(`${import.meta.env.VITE_API_URL}/api/parts/${partId}`, {
                quantity: newStock,
                skipAvailabilityCheck: true,
              });
            }
          );

          await Promise.all(updatePartStockPromises); // Wait all updates
          console.log("Stock updated successfully for parts:", partUsage);
        } catch (error) {
          console.error("Error updating stock after checkout:", error);
        }
      }, 1000); // Delay to ensure navigation happens first to avoid conflicts with stock alerts
    } catch (error) {
      console.error("Error creating custom product:", error);
      alert("There was an error processing your order. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6" id="cart-title">
        My Cart
      </h1>
      {/* Added ID to associate the heading with the cart for accessibility */}

      {cart.length > 0 ? (
        <>
          <ul>
            {cart.map((product, index) => {
              const partsTotal = product.parts?.reduce((sum, part) => sum + part.price, 0) || 0;
              const totalPrice = product.price + partsTotal;

              return (
                <li
                  key={index}
                  className="bg-white shadow-md  shadow-blue-950 border-2 border-gray-500  p-4 my-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">{product.name}</h2>
                      <p className="text-gray-600">Base Price: {product.price.toFixed(2)}€</p>

                      {/* Display selected parts */}
                      {product.parts && product.parts.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Selected Parts:</p>
                          <ul className="list-disc pl-5 text-gray-700">
                            {product.parts.map((part, i) => (
                              <li key={i}>
                                <strong>{part.category}:</strong> {part.value} (
                                {part.price.toFixed(2)}€)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Show total price of the product including parts */}
                      <p className="font-bold text-lg mt-3">Total: {totalPrice.toFixed(2)}€</p>
                    </div>

                    {/* Button to remove product */}
                    <button
                      className="bg-red-500 text-white p-3 rounded-full hover:bg-red-700"
                      onClick={() => removeFromCart(product.id)}
                      aria-label={`Remove ${product.name} from cart`}
                      // Provides a clear description for screen readers
                    >
                      <TrashIcon className="h-6 w-6" aria-hidden="true" />
                      {/* Marks the icon as decorative for screen readers */}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Purchase summary */}

          <div className="bg-white shadow-lg  shadow-blue-950 border-2 border-gray-500  p-4 my-4 rounded-lg">
            <p className="font-bold text-lg">Subtotal: {subtotal.toFixed(2)}€</p>
            <p className="text-gray-600">IVA (21%): {iva.toFixed(2)}€</p>
            <p className="font-bold text-xl">Total: {total.toFixed(2)}€</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-6">
            {/* Continue Shopping button */}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => navigate("/bicycle-shop-frontend/")}
              aria-label="Continue shopping and browse more products"
              // Adds clear action description for screen readers
            >
              Continue Shopping
            </button>

            {/* Proceed to Pay button */}
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              onClick={handleCheckout}
              disabled={loadingCheckout}
              aria-live="polite"
              // Ensures screen readers announce checkout progress
            >
              {loadingCheckout ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-1 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="status"
                    // Marks spinner as a status update
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            {/* Clear Cart totally */}
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-800"
              onClick={clearCart}
              aria-label="Clear all products from your cart"
              // Clearly describes the action for screen readers
            >
              Clear Cart
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500" role="alert">
          Your cart is empty.
        </p>
        // Provides an alert for screen readers when the cart is empty
      )}
    </div>
  );
};

export default CartScreen;
