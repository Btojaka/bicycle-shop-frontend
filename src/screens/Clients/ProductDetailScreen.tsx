import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import useCartStore from "../../store/cartStore";
import socket from "../../helpers/socket";
import { useProductStore } from "../../store/useProductStore";

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
}

interface Part {
  id: number;
  category: string;
  value: string;
  price: number;
  isAvailable: boolean;
  quantity: number;
}

const ProductDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { restrictions } = useProductStore(); // Get restrictions from global store
  const [product, setProduct] = useState<Product | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedParts, setSelectedParts] = useState<Record<string, Part | null>>({});
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingAddToCart, setLoadingAddToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Load product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  // Load parts for the selected product type
  useEffect(() => {
    if (product) {
      const fetchParts = async () => {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/parts?typeProduct=${product.type}`
          );
          setParts(data);
        } catch (error) {
          console.error("Error fetching parts:", error);
        }
      };
      fetchParts();
    }
  }, [product]);

  // Listeners for real-time updates
  useEffect(() => {
    if (!product) return;

    // Listen for updates to the current product
    socket.on("productUpdated", (updatedProduct) => {
      if (updatedProduct.id === product.id) {
        console.log("Updated product in real time:", updatedProduct);
        setProduct(updatedProduct);
      }
    });

    // Listen for deletions of the current product
    socket.on("productDeleted", ({ id }) => {
      if (id === product.id) {
        alert("This product has been deleted. You will be redirected to the homepage.");
        navigate("/bicycle-shop-frontend/"); // Redirect to home
      }
    });

    // Listen for updates to parts
    socket.on("partUpdated", (updatedPart) => {
      setParts((prevParts) =>
        prevParts.map((part) => (part.id === updatedPart.id ? updatedPart : part))
      );

      // Update selected parts if the part is no longer available
      if (!updatedPart.isAvailable) {
        setSelectedParts((prevSelectedParts) => ({
          ...prevSelectedParts,
          [updatedPart.category]: null, // Delete the part from the selection
        }));
      }
    });

    // Listen for deletions of parts
    socket.on("partDeleted", ({ id }) => {
      setParts((prevParts) => prevParts.filter((part) => part.id !== id));

      // Remove the part from the selection if it was selected
      setSelectedParts((prevSelectedParts) => {
        const updatedSelectedParts = { ...prevSelectedParts };
        Object.keys(updatedSelectedParts).forEach((category) => {
          if (updatedSelectedParts[category]?.id === id) {
            updatedSelectedParts[category] = null;
          }
        });
        return updatedSelectedParts; // Return the updated selection
      });
    });

    return () => {
      socket.off("productUpdated");
      socket.off("productDeleted");
      socket.off("partUpdated");
      socket.off("partDeleted");
    };
  }, [product]); // Only run when the product changes

  // Validations and restrictions
  useEffect(() => {
    const allPartsSelected =
      Object.keys(selectedParts).length > 0 &&
      orderedCategories.every((category) => selectedParts[category]);

    console.log("All parts selected after update:", allPartsSelected);
  }, [selectedParts]);

  useEffect(() => {
    console.log("🔍 selectedParts has changed:", selectedParts);
  }, [selectedParts]);

  // Validate selections and update the selected parts
  const validateSelections = (category: string, selectedPart: Part) => {
    let updatedSelectedParts: Record<string, Part | null> = {
      ...selectedParts,
      [category]: selectedPart,
    };

    // Restrictions for specific combinations
    if (category === "Wheels") {
      updatedSelectedParts = { Wheels: selectedPart };
    }

    if (category === "Frame Type") {
      if (
        selectedParts["Wheels"]?.value === "mountain wheels" &&
        selectedPart.value !== "full-suspension"
      ) {
        updatedSelectedParts["Frame Type"] = null;
      }
    }

    if (category === "Rim Color") {
      if (selectedParts["Wheels"]?.value === "fat bike wheels" && selectedPart.value !== "black") {
        updatedSelectedParts["Rim Color"] = null;
      }
    }
    // Update the selected parts correctly
    setSelectedParts(updatedSelectedParts);
  };

  const productRestrictions = product ? restrictions[product.id] || {} : {};
  console.log("productRestrictions", productRestrictions);

  const isPartRestricted = (category: string, part: Part) => {
    if (!productRestrictions[category]) return false;
    return productRestrictions[category].includes(part.value);
  };

  const handleSelectPart = (category: string, part: Part) => {
    validateSelections(category, part);
    setSelectedParts((prev) => ({
      ...prev,
      [category]: part, // Update only the current category
    }));

    setTimeout(() => {
      console.log("🔄 selectedParts después de la actualización:", selectedParts);
    }, 500);
  };

  // Function to group parts by category
  const groupedParts = parts.reduce((acc: Record<string, Part[]>, part) => {
    if (!acc[part.category]) acc[part.category] = [];
    acc[part.category].push(part);
    return acc;
  }, {});

  // Order categories for bicycles
  const orderedCategories =
    product?.type === "bicycle"
      ? [
          "Wheels",
          "Frame Type",
          "Rim Color",
          ...Object.keys(groupedParts).filter(
            (c) => !["Wheels", "Frame Type", "Rim Color"].includes(c)
          ),
        ]
      : Object.keys(groupedParts); // To other types of products alphabetically

  // Verify stock before adding to cart
  const verifyStockBeforeAddingToCart = async (
    product: Product,
    selectedParts: Record<string, Part | null>
  ) => {
    try {
      const productResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products/${product.id}`
      );
      // Verify if the product is still available
      if (!productResponse.data.isAvailable) {
        alert("The product cannot be added to the cart because it is no longer available.");
        setProduct((prev) => (prev ? { ...prev, isAvailable: false } : prev));
        return false;
      }

      let updatedParts = [...parts];
      let stockChanged = false;

      // Create a copy of the selected parts to update
      const updatedSelectedParts = { ...selectedParts };

      // Verify the stock of each selected part
      for (const part of Object.values(selectedParts)) {
        if (!part) continue; // avoid problems with null

        const partResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/parts/${part.id}`
        );

        if (!partResponse.data.isAvailable) {
          alert(
            `The product cannot be added to the cart because the part "${part.value}" is no longer available.`
          );

          updatedParts = updatedParts.map((p) =>
            p.id === part.id ? { ...p, isAvailable: false } : p
          );

          // Remove the part from the selection
          updatedSelectedParts[part.category] = null;
          stockChanged = true;
        }

        const cartItems = useCartStore.getState().cart;
        const countInCart = cartItems.reduce((sum, item) => {
          const totalCount = sum + (item.parts?.filter((p) => p.id === part.id).length || 0);
          return totalCount;
        }, 0);

        // If the sum of the cart + new attempt is greater than the stock, block
        if (countInCart + 1 > partResponse.data.quantity) {
          alert(
            `Not enough stock for "${part.value}". Only ${partResponse.data.quantity} left and it/them is/are already in your cart.`
          );
          return false;
        }
      }

      if (stockChanged) {
        setParts(updatedParts);

        // Force update to revalidate the selection after any change
        setSelectedParts((prev) => ({
          ...prev,
          ...updatedSelectedParts,
        }));

        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verifying stock:", error);
      alert("Error verifying stock, try again later.");
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      setLoadingAddToCart(true);
      // Filter the parts selected
      const selectedPartsArray = Object.values(selectedParts).filter(Boolean) as Part[];
      // Check if all parts are available
      const isStockAvailable = await verifyStockBeforeAddingToCart(product, selectedParts);

      // If something is not available don't add to cart
      if (!isStockAvailable) {
        setLoadingAddToCart(false);
        return;
      }

      // Validate that all categories are selected after updating
      setTimeout(() => {
        const hasPartsToSelect = parts.some((part) => part.category in groupedParts); // check if exist parts to associate
        const allPartsSelected =
          !hasPartsToSelect || orderedCategories.every((category) => selectedParts[category]);

        console.log("All parts selected before adding to cart (after delay):", allPartsSelected);

        if (!allPartsSelected) {
          alert(
            "All categories must be selected without restrictions or unavailable values before adding to cart."
          );
          setLoadingAddToCart(false);
          return;
        }

        const productToAdd = {
          ...product,
          parts: selectedPartsArray,
        };

        addToCart(productToAdd);
        navigate("/cart");
      }, 0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {loadingProduct ? (
        <p className="text-center text-gray-500" role="status" aria-live="polite">
          🔄 Loading product details...
        </p>
      ) : // role="status" and aria-live="polite" announce loading status
      !product ? (
        <p className="text-center text-red-500" role="alert">
          Product not found
        </p>
      ) : (
        // role="alert" notify users of the error
        <>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-lg text-gray-600">Type: {product.type}</p>
          <p className="text-lg font-bold">{product.price.toFixed(2)}€</p>

          <h2 className="text-2xl font-semibold mt-6">
            Customize your <span className="sr-only">{product.name}</span>
          </h2>
          {/* sr-only -> product name is read but not visible for better context */}

          {orderedCategories.map((category) => (
            <div key={category} className="mt-4">
              <label className="block text-lg font-medium" htmlFor={`select-${category}`}>
                {category}:
              </label>
              {/* Added htmlFor to associate label with select */}

              <select
                id={`select-${category}`}
                className="bg-gray-200 text-gray-900 text-lg mt-1 p-2 border border-gray-400 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const selectedPart = parts.find((p) => p.id === Number(e.target.value));
                  if (selectedPart) handleSelectPart(category, selectedPart);
                }}
              >
                {/* Restrictions in combination */}
                <option value="">Select an option</option>
                {groupedParts[category]?.map((part) => {
                  const isRestricted =
                    (category === "Frame Type" &&
                      selectedParts["Wheels"]?.value === "mountain wheels" &&
                      part.value !== "full-suspension") ||
                    (category === "Wheels" &&
                      selectedParts["Frame Type"] &&
                      selectedParts["Frame Type"].value !== "full-suspension" &&
                      part.value === "mountain wheels") ||
                    (category === "Rim Color" &&
                      selectedParts["Wheels"]?.value === "fat bike wheels" &&
                      part.value === "red") ||
                    (category === "Wheels" &&
                      selectedParts["Rim Color"]?.value === "red" &&
                      part.value === "fat bike wheels");

                  return (
                    <option
                      key={part.id}
                      value={part.id}
                      disabled={
                        !part.isAvailable || isRestricted || isPartRestricted(category, part)
                      }
                      className={part.isAvailable ? "text-gray-900" : "text-gray-400"}
                      aria-disabled={
                        !part.isAvailable || isRestricted || isPartRestricted(category, part)
                      } // helps screen readers understand non-selectable options
                    >
                      {part.value} (+ {part.price.toFixed(2)} €){" "}
                      {!part.isAvailable && "(Temporarily out of stock)"}
                      {isRestricted && "(Restricted combination)"}
                      {isPartRestricted(category, part) && "(Restricted in this product)"}
                    </option>
                  );
                })}
              </select>

              {/* Message low available stock */}
              {groupedParts[category]?.filter((p) => p.quantity <= 5 && p.quantity > 0).length >
                0 && (
                <p className="text-red-500 text-sm mt-1" role="status" aria-live="polite">
                  {" "}
                  {/* aria-live ensures stock warnings are announced dynamically */}
                  ⚠️ Limited stock for:{" "}
                  {groupedParts[category]
                    ?.filter((p) => p.quantity <= 5 && p.quantity > 0 && p.isAvailable)
                    .map((p) => `${p.value} (${p.quantity} left)`)
                    .join(", ")}
                </p>
              )}
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Link
              to="/bicycle-shop-frontend/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              aria-label="Go back to the product list" // to improve clarity for screen readers
            >
              ← Back to Products
            </Link>
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              disabled={loadingAddToCart}
              aria-live="polite"
              aria-busy={loadingAddToCart}
            >
              {loadingAddToCart ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Loading"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
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
                "Add to Cart"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetailScreen;
