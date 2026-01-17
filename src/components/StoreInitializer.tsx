"use client";

import { useRef, useEffect } from "react";
import { useStore } from "@/lib/store";

export default function StoreInitializer() {
    const initialized = useRef(false);
    const fetchData = useStore((state) => state.fetchData);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchData();
        }
    }, [fetchData]);

    return null;
}
