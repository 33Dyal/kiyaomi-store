"use client";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useCurrentUser } from "./use-current-user";

export function useCartSync() {
  const { data: user } = useCurrentUser();
  const items = useCartStore((s) => s.items);
  const setItems = useCartStore((s) => s.setItems);
  const hasMergedRef = useRef(false);
  const wasLoggedInRef = useRef(false);

 

  // On login: merge guest cart into the account's saved cart once.
  useEffect(() => {
    if (!user || hasMergedRef.current) return;
    console.log("CartSync: running login merge for user", user.id);
    hasMergedRef.current = true;
    wasLoggedInRef.current = true;

    (async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const json = await res.json();
      const serverItems = json.data?.items ?? [];

      const merged = [...serverItems];
      for (const guestItem of items) {
        const existing = merged.find(
          (i) => i.productId === guestItem.productId && i.variantId === guestItem.variantId
        );
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          merged.push(guestItem);
        }
      }

      console.log("CartSync: merged cart on login ->", merged);
      setItems(merged);
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: merged.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        }),
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // On logout: clear local cart so the next person on this device/browser
  // doesn't inherit this account's items.
  useEffect(() => {
    console.log("CartSync: logout-check effect fired — user:", user, "wasLoggedIn:", wasLoggedInRef.current);
    if (wasLoggedInRef.current && user === null) {
      console.log("CartSync: clearing cart on logout");
      useCartStore.getState().clear();
      hasMergedRef.current = false;
      wasLoggedInRef.current = false;
    }
  }, [user]);

  // While logged in, push any subsequent local changes to the server
  // (debounced), so add/remove/update from anywhere in the app stays synced.
  useEffect(() => {
    if (!user || !hasMergedRef.current) return;
    const timer = setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        }),
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [items, user]);
}