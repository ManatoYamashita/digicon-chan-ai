import React from "react";

type EmotionProps = {
    emotion: string;
}

export default function EmoDCchan({ emotion }: EmotionProps) {
    return (
        <div>
            <h1>EmoDCchan</h1>
            <p>Emotion: {emotion}</p>
        </div>
    )
}