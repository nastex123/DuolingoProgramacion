'use client';

import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface KodaMascotProps {
  mood?: 'idle' | 'happy' | 'thinking';
  size?: number;
}

export const KodaMascot: React.FC<KodaMascotProps> = ({
  mood = 'idle',
  size = 140,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Crear aplicación PIXI WebGL
    const app = new PIXI.Application({
      width: size,
      height: size,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Dibujar a Koda (Zorro Geométrico estilizado)
    const mascotContainer = new PIXI.Container();
    mascotContainer.x = size / 2;
    mascotContainer.y = size / 2 + 10;
    app.stage.addChild(mascotContainer);

    const graphics = new PIXI.Graphics();
    mascotContainer.addChild(graphics);

    const drawKoda = (offsetY: number) => {
      graphics.clear();

      // Orejas
      graphics.beginFill(0xf97316); // Naranja Koda
      graphics.drawPolygon([-35, -25 + offsetY, -20, -55 + offsetY, -5, -25 + offsetY]);
      graphics.drawPolygon([35, -25 + offsetY, 20, -55 + offsetY, 5, -25 + offsetY]);
      graphics.endFill();

      // Interior de orejas
      graphics.beginFill(0xfef08a); // Amarillo suave
      graphics.drawPolygon([-30, -28 + offsetY, -20, -48 + offsetY, -10, -28 + offsetY]);
      graphics.drawPolygon([30, -28 + offsetY, 20, -48 + offsetY, 10, -28 + offsetY]);
      graphics.endFill();

      // Cabeza principal
      graphics.beginFill(0xf97316);
      graphics.drawRoundedRect(-40, -30 + offsetY, 80, 55, 18);
      graphics.endFill();

      // Mejillas blancas
      graphics.beginFill(0xffffff);
      graphics.drawRoundedRect(-32, -5 + offsetY, 64, 28, 14);
      graphics.endFill();

      // Ojos
      graphics.beginFill(0x0f172a);
      if (mood === 'happy') {
        // Ojos felices curvados
        graphics.drawCircle(-15, -10 + offsetY, 4);
        graphics.drawCircle(15, -10 + offsetY, 4);
      } else {
        graphics.drawCircle(-15, -8 + offsetY, 5);
        graphics.drawCircle(15, -8 + offsetY, 5);
        // Brillo en los ojos
        graphics.beginFill(0xffffff);
        graphics.drawCircle(-13, -10 + offsetY, 2);
        graphics.drawCircle(17, -10 + offsetY, 2);
      }
      graphics.endFill();

      // Nariz
      graphics.beginFill(0x1e293b);
      graphics.drawPolygon([-5, 3 + offsetY, 5, 3 + offsetY, 0, 8 + offsetY]);
      graphics.endFill();

      // Boca
      graphics.lineStyle(2, 0x1e293b);
      graphics.moveTo(-4, 9 + offsetY);
      graphics.lineTo(0, 11 + offsetY);
      graphics.lineTo(4, 9 + offsetY);
    };

    // Animación suave de flotación
    let elapsed = 0;
    app.ticker.add((delta) => {
      elapsed += delta * 0.05;
      const floatY = Math.sin(elapsed) * 4;
      drawKoda(floatY);
    });

    return () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      appRef.current = null;
    };
  }, [mood, size]);

  return <div ref={containerRef} className="flex items-center justify-center" />;
};
