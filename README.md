# 🏄 Bicycle Shop - Frontend

This is the frontend of the **Bicycle Shop** application, built with **React (Vite) and TypeScript**. It allows users to browse and purchase bicycle-related products while administrators can manage the product catalog.

## 🚀 Live Demo

The application is deployed at:  
🔗 [Bicycle Shop - Frontend](https://tuusuario.github.io/bicycle-shop-frontend/)

## 📦 Tech Stack

- **React + Vite** (Frontend)
- **TypeScript** (Static Typing)
- **Zustand** (State Management)
- **React Router** (Navigation)
- **Axios** (API Calls)
- **Vitest + Testing Library** (Unit & Integration Testing)
- **Tailwind CSS** (Styling)
- **ESLint & Prettier** (Code Linting & Formatting)

---

## 🛠️ Setup Instructions

### 1️⃣ **Clone the repository**

```sh
git clone https://github.com/Btojaka/bicycle-shop-frontend.git
cd bicycle-shop-frontend
```

### 2️⃣ **Install dependencies**

```sh
npm install
```

### 3️⃣ **Run the development server**

```sh
npm run dev
```

The app will be available at **http://localhost:5173/**.

---

## 🔗 API & Backend Integration

This frontend interacts with the **Bicycle Shop Backend**, available at:

🔗 **Backend Repository:** [Bicycle Shop - Backend](https://github.com/Btojaka/bicycle-shop-backend)  
🛄️ **Database:** Hosted on **Railway**  
🛡️ **API Base URL:** `http://localhost:4000`  
📝 **API Documentation:** `http://localhost:4000/docs`

I have added a small sample of testing, follow the setup instructions in the backend repository.

---

## ✅ Testing

### Run Unit & Integration Tests

```sh
npm run test
```

---

## ⚖️ Trade-offs and Development Decisions

### 1️⃣ **Zustand instead of Redux**

- Chose Zustand over Redux due to its **simpler API and lightweight nature**.
- Redux would offer more scalability but would require more boilerplate.

### 2️⃣ **Vitest instead of Jest**

- Since the project uses **Vite**, Vitest was chosen for better integration and speed.

### 3️⃣ **Real-Time Updates with Socket.IO**

- Enables **real-time product updates**.
- Trade-off: Requires **handling socket events carefully** to avoid unnecessary re-renders.

### 4️⃣ **API Calls with Axios**

- Chose Axios for **better error handling and interceptors**.
- API base URL is dynamically configured with **environment variables**.

### 5️⃣ **Accessibility Improvements**

- **ARIA roles and labels** for screen reader support.
- **Live announcements** for loading states and real-time updates.

---

## 🎯 Key Challenges and Solutions

### **1️⃣ Lag in Product Loading**

- **Problem:** When navigating, there was noticeable lag when loading products or parts.
- **Solution:** Used **`useMemo`** and **`React.memo`** to optimize filtering and sorting.

### **2️⃣ Real-Time Product Updates**

- **Problem:** Changes in product availability and attributes were not reflected immediately.
- **Solution:** Integrated **WebSockets (Socket.IO)** to handle real-time updates efficiently.

### **3️⃣ Managing State with Zustand**

- **Problem:** Redux would have required unnecessary complexity for a small application.
- **Solution:** Zustand provided a **simpler, more modular** state management approach.

### **4️⃣ Component Reusability**

- **Solution:** Created reusable components like **Filters** and **Modals** to keep code DRY.

### **5️⃣ Dynamic Restrictions**

- **Problem:** Certain product configurations needed restrictions based on other selections.
- **Solution:** Updated the backend to support **dynamic validation rules** for product restrictions.

### **6️⃣ Dynamic Filters**

- **Solution:** Implemented flexible **filtering mechanisms** to support different product types and attributes.

This ensures a **fast, responsive**, and **user-friendly** application.

---

# 🏄 Bicycle Shop - Frontend (Español)

Este es el frontend de la aplicación **Bicycle Shop**, desarrollada con **React (Vite) y TypeScript**. Permite a los usuarios explorar y comprar productos relacionados con bicicletas, mientras que los administradores pueden gestionar el catálogo de productos.

## 🚀 Demo en Vivo

_Se planea desplegar la aplicación usando GitHub Pages._

## 📦 Tecnologías Utilizadas

- **React + Vite** (Frontend)
- **TypeScript** (Tipado Estático)
- **Zustand** (Gestión de Estado)
- **React Router** (Navegación)
- **Axios** (Llamadas a API)
- **Vitest + Testing Library** (Pruebas Unitarias e Integración)
- **Tailwind CSS** (Estilización)
- **ESLint & Prettier** (Linting y Formateo de Código)

## ⚖️ Decisiones de Desarrollo y Trade-offs

### **1️⃣ Manejo del Lag en la Carga de Productos**

- **Problema:** Al navegar, la carga de productos o partes tenía retrasos.
- **Solución:** Se usaron **`useMemo`** y **`React.memo`** para optimizar los filtros y la carga.

### **2️⃣ Actualizaciones en Tiempo Real**

- **Problema:** Los cambios en disponibilidad y atributos de los productos no se reflejaban de inmediato.
- **Solución:** Se implementaron **WebSockets (Socket.IO)** para actualizar la interfaz en tiempo real.

### **3️⃣ Gestión del Estado con Zustand**

- **Problema:** Redux era demasiado complejo para esta aplicación.
- **Solución:** Se usó Zustand para una gestión de estado más simple y modular.

### **4️⃣ Componentes Reutilizables**

- **Solución:** Se crearon componentes reutilizables como **Filtros** y **Modales**.

### **5️⃣ Restricciones Dinámicas**

- **Problema:** Se necesitaban restricciones en las configuraciones de productos.
- **Solución:** Se modificó el backend para admitir **reglas de validación dinámicas**.

### **6️⃣ Filtros Dinámicos**

- **Solución:** Se implementaron mecanismos flexibles de **filtrado** para soportar diferentes tipos de productos.

Esto garantiza una aplicación **rápida, responsiva** y **amigable para el usuario**.

---

🔗 **Repositorio Frontend:** [Bicycle Shop - Frontend](https://github.com/Btojaka/bicycle-shop-frontend)  
🔗 **Repositorio Backend:** [Bicycle Shop - Backend](https://github.com/Btojaka/bicycle-shop-backend)
