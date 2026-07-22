import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('letoile_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [voucherCode, setVoucherCode] = useState(() => {
    return localStorage.getItem('letoile_cart_voucher') || '';
  });

  const [selectedTable, setSelectedTable] = useState(() => {
    const saved = localStorage.getItem('letoile_cart_table');
    return saved ? JSON.parse(saved) : null;
  });

  const [discountAmount, setDiscountAmount] = useState(0);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('letoile_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('letoile_cart_voucher', voucherCode);
  }, [voucherCode]);

  useEffect(() => {
    if (selectedTable) {
      localStorage.setItem('letoile_cart_table', JSON.stringify(selectedTable));
    } else {
      localStorage.removeItem('letoile_cart_table');
    }
  }, [selectedTable]);

  // Recalculate totals whenever items or voucher changes
  const calculateCartServer = async () => {
    if (items.length === 0) {
      setDiscountAmount(0);
      return;
    }
    setCalculationLoading(true);
    try {
      const payload = {
        items: items.map(i => ({ dishId: i.id, quantity: i.quantity, note: i.note })),
        voucherCode: voucherCode ? voucherCode : null
      };

      const res = await api.post('/api/public/cart/calculate', payload);
      if (res.data && res.data.success) {
        setDiscountAmount(res.data.data.discountAmount || 0);
      }
    } catch (err) {
      console.error(err);
      setDiscountAmount(0);
    } finally {
      setCalculationLoading(false);
    }
  };

  useEffect(() => {
    calculateCartServer();
  }, [items, voucherCode]);

  const addToCart = (dish, note = '') => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1, note: note || item.note }
            : item
        );
      }
      return [...prev, { id: dish.id, name: dish.name, price: dish.price, image: dish.image, quantity: 1, note }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (dishId) => {
    setItems((prev) => prev.filter((item) => item.id !== dishId));
  };

  const updateQuantity = (dishId, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === dishId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateNote = (dishId, note) => {
    setItems((prev) =>
      prev.map((item) => (item.id === dishId ? { ...item, note } : item))
    );
  };

  const applyVoucher = async (code) => {
    setVoucherCode(code.trim().toUpperCase());
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setDiscountAmount(0);
  };

  const clearCart = () => {
    setItems([]);
    setVoucherCode('');
    setDiscountAmount(0);
    setSelectedTable(null);
    localStorage.removeItem('letoile_cart_items');
    localStorage.removeItem('letoile_cart_voucher');
    localStorage.removeItem('letoile_cart_table');
  };

  // Financial Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const serviceFee = taxableAmount * 0.05; // 5% Service Fee
  const vatAmount = taxableAmount * 0.08;    // 8% VAT Tax
  const grandTotal = taxableAmount + serviceFee + vatAmount;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNote,
        voucherCode,
        applyVoucher,
        removeVoucher,
        clearCart,
        subtotal,
        discountAmount,
        taxableAmount,
        serviceFee,
        vatAmount,
        grandTotal,
        itemCount,
        calculationLoading,
        isCartOpen,
        setIsCartOpen,
        selectedTable,
        setSelectedTable
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
