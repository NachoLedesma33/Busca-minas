# Buscaminas Arcade

Un juego de Buscaminas con estilo arcade, construido con React + Chakra UI v3.

## Características

- **4 modos de dificultad**: Fácil (9×9), Medio (16×16), Difícil (30×16) y Personalizado
- **Primer clic seguro**: nunca se pierde en el primer clic (la mina se reubica)
- **Chord click**: revela celdas adyacentes automáticamente al hacer clic en una celda ya revelada si la cantidad de banderas alrededor coincide con el número
- **Contador de banderas con tope**: no se pueden colocar más banderas que minas totales
- **Animaciones**: cascada con Framer Motion al revelar celdas, hover con escala 1.08
- **Efectos de sonido**: sintetizados vía Web Audio API (revelar, bandera, explosión, victoria, chord)
- **Récords locales**: mejor tiempo por dificultad guardado en localStorage con notificación de "¡Nuevo récord!"
- **Theme toggle**: palanca mecánica (Lever Switch) para cambiar entre modo oscuro y claro
- **Fondo dinámico**: Cosmic Background con Three.js y shaders GLSL (variante aurora) que se adapta al tema
- **Diseño responsivo**: tablero con scroll horizontal fino, celdas adaptables, layout que se ajusta a móviles

## Stack

- [React](https://react.dev)
- [Chakra UI v3](https://chakra-ui.com)
- [Framer Motion](https://www.framer.com/motion)
- [Three.js](https://threejs.org)
- [Lucide React](https://lucide.dev)
- [Vite](https://vitejs.dev)

## Instalación

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

## Deploy

El proyecto está configurado para deploy en GitHub Pages y Vercel.
