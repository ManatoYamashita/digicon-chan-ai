import React from 'react';
import "@/styles/globals.css";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    
    return (
        <div className="body-talk">
            {children}
        </div>
    );
}
