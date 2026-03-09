'use client';

import React, { useRef, useState, MouseEvent } from 'react';

export function DraggableRow({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);

    const onMouseDown = (e: MouseEvent) => {
        if (!sliderRef.current) return;
        setIsDown(true);
        setHasDragged(false);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const onMouseLeave = () => {
        setIsDown(false);
    };

    const onMouseUp = () => {
        setIsDown(false);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDown || !sliderRef.current) return;

        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 2; // scroll speed multiplier

        if (Math.abs(walk) > 10) {
            setHasDragged(true);
            // We shouldn't necessarily prevent default here for all browsers, 
            // but it's okay to let native pan actions be overriden by our drag.
        }

        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    const onClickCapture = (e: MouseEvent) => {
        if (hasDragged) {
            e.stopPropagation();
            e.preventDefault();
            setHasDragged(false);
        }
    };

    return (
        <div
            id={id}
            ref={sliderRef}
            className={`select-none ${isDown ? 'cursor-grabbing' : 'cursor-grab'} ${hasDragged ? '[&_*]:pointer-events-none' : ''} ${className}`}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onClickCapture={onClickCapture}
            onDragStart={(e) => e.preventDefault()}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {children}
        </div>
    );
}

