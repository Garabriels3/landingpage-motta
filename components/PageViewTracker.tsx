"use client";

import { useEffect } from "react";
import { tracking } from "@/lib/tracking";

interface PageViewTrackerProps {
    pagina: string;
    metadata?: Record<string, any>;
}

export default function PageViewTracker({ pagina, metadata }: PageViewTrackerProps) {
    useEffect(() => {
        tracking.pageView(pagina, metadata);
    }, [pagina, metadata]);

    return null;
}

