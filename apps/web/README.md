# Percy's Library - Web Frontend

Frontend moderno de Percy's Library construido con React, Vite, TypeScript y TailwindCSS.

## Características del Diseño

### Psicología del Color
- **Azul (Confianza)**: Color principal que transmite confianza, calma y confiabilidad (similar a PayPal, Facebook)
- **Amarillo (Energía)**: Color de acento para creatividad y calidez
- **Tonos neutros**: Para balance y legibilidad

### Temas Disponibles
1. **Ocean Trust**: Tema principal basado en azul profesional
2. **Midnight Focus**: Modo oscuro con acentos azules
3. **Serene Calm**: Tema claro y aireado
4. **Royal Confidence**: Azul profundo con acentos dorados

### Características de UI
- Diseño responsivo y moderno
- Sistema de temas coherente
- Animaciones suaves
- Interfaz limpia y no genérica
- Accesibilidad y alto contraste

## Tecnologías

- **React 18**: Framework de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool rápido
- **TailwindCSS**: Framework de CSS utility-first
- **React Router**: Enrutamiento
- **Lucide React**: Iconos modernos

## Scripts

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas principales
├── hooks/          # Hooks personalizados
├── utils/          # Utilidades y helpers
├── types/          # Definiciones de TypeScript
└── assets/         # Archivos estáticos
```

## Integración con API

El frontend se comunica con el backend en `http://localhost:4000` a través del proxy configurado en Vite.

## Notas de Diseño

- La paleta de colores está diseñada para transmitir confianza y profesionalismo
- El sistema de temas permite personalización manteniendo coherencia
- Las animaciones son sutiles para mejorar la UX sin distraer
- La tipografía usa Inter para legibilidad y Poppins para títulos
