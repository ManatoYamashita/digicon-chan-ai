"use client";

import React, { useEffect } from "react";
import "@/styles/globals.css";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    
    useEffect(() => {
        const body = document.body;
        body.classList.add("body-about");
    
        return () => {
          body.classList.remove("body-about");
        };
      }, []);

    return (
        <div>
            {children}
        </div>
    );
}
