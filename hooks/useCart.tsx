import { CartProductType } from "@/app/product/[productId]/ProductDetails";
import { product } from "@/utils/product";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { toast } from "react-hot-toast";

type CartContextType = {
  cartTotalQty: number;
  cartTotalAmount: number;
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveProductFromCart: (product: CartProductType) => void;
  handleCartQtyIncrease: (product: CartProductType) => void;
  handleCartQtyDecrease: (product: CartProductType) => void;
  handleClearCart: () => void;
};

interface Props {
  [propName: string]: any;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartContextProvider = (props: Props) => {
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(
    null
  );

  const [cartTotalAmount, setCartTotalAmount] = useState(0);

  useEffect(() => {
    const cartItems: any = localStorage.getItem("eShopCartItems");
    const cProducts: CartProductType[] | null = JSON.parse(cartItems);

    setCartProducts(cProducts);
  }, []);

  useEffect(() => {
    const getTotals = () => {
      if (cartProducts) {
        const { total, qty } = cartProducts?.reduce(
          (acc, item) => {
            const itemTotal = item.price * item.quantity;
            acc.total += itemTotal;
            acc.qty += item.quantity;
            return acc;
          },
          {
            total: 0,
            qty: 0,
          }
        );
        setCartTotalQty(qty);
        setCartTotalAmount(total);
      }
    };
    getTotals();
  }, [cartProducts]);

  const handleAddProductToCart = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      let updateCart;
      if (prev) {
        updateCart = [...prev, product];
      } else {
        updateCart = [product];
      }
      toast.success("Product added to cart");
      localStorage.setItem("eShopCartItems", JSON.stringify(updateCart));
      return updateCart;
    });
    setCartTotalQty((prev) => {
      return ++prev;
    });
  }, []);

  const handleRemoveProductFromCart = useCallback(
    (product: CartProductType) => {
      if (cartProducts) {
        const filterProducts = cartProducts.filter(
          (item) => item.id !== product.id
        );
        setCartProducts(filterProducts);
        toast.success("Product removed");
        localStorage.setItem("eShopCartItems", JSON.stringify(filterProducts));
      }
    },
    [cartProducts]
  );

  const handleCartQtyIncrease = useCallback(
    (product: CartProductType) => {
      let updateCart;
      if (product.quantity === 99) return toast.error("Oops!!! Maximum reach");
      if (cartProducts) {
        updateCart = [...cartProducts];

        const existingIndex = cartProducts.findIndex(
          (item) => item.id === product.id
        );
        if (existingIndex > -1)
          updateCart[existingIndex].quantity = ++updateCart[existingIndex]
            .quantity;
        setCartProducts(updateCart);
        localStorage.setItem("eShopCartItems", JSON.stringify(updateCart));
      }
    },
    [cartProducts]
  );

  const handleCartQtyDecrease = useCallback(
    (product: CartProductType) => {
      let updateCart;
      if (product.quantity === 1) return;
      if (cartProducts) {
        updateCart = [...cartProducts];

        const existingIndex = cartProducts.findIndex(
          (item) => item.id === product.id
        );
        if (existingIndex > -1)
          updateCart[existingIndex].quantity = --updateCart[existingIndex]
            .quantity;
        setCartProducts(updateCart);
        localStorage.setItem("eShopCartItems", JSON.stringify(updateCart));
      }
    },
    [cartProducts]
  );

  const handleClearCart = useCallback(() => {
    setCartProducts(null);
    setCartTotalQty(0);
    localStorage.setItem("eShopCartItems", JSON.stringify(null));
  }, [cartProducts]);
  const value = {
    cartTotalQty,
    cartProducts,
    cartTotalAmount,
    handleAddProductToCart,
    handleRemoveProductFromCart,
    handleCartQtyIncrease,
    handleCartQtyDecrease,
    handleClearCart,
  };
  return <CartContext.Provider value={value} {...props} />;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart must be used within a CartContextProvider");
  }

  return context;
};
