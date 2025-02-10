# 🏄 Bicycle Shop - Frontend

This is the frontend of the **Bicycle Shop** application, built with **React (Vite) and TypeScript**. It allows users to browse and purchase bicycle-related products while administrators can manage the product and parts catalog.

## 🚀 Live Demo

The application is deployed at:  
🔗 [Bicycle Shop - Frontend](https://btojaka.github.io/bicycle-shop-frontend/)

## 📦 Tech Stack

- **React + Vite** (Frontend)
- **TypeScript** (Static Typing)
- **Zustand** (State Management)
- **React Router** (Navigation)
- **Axios** (API Calls)
- **WebSockets** (Real-time Communication)
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

The app will be available at http://localhost:5173/bicycle-shop-frontend/

### ℹ️ No environment variables needed

The project does not require a .env file since it directly points to the backend in the Vite config.

---

## 🔗 API & Backend Integration

This frontend interacts with the **Bicycle Shop Backend**, available at:

🔗 **Backend Repository:** [Bicycle Shop - Backend](https://github.com/Btojaka/bicycle-shop-backend)  
🛄️ **Database:** Hosted on **Railway**  
🛡️ **API Base URL:** `https://bicycle-shop-backend-jqz7.onrender.com/api/products`
📝 **API Documentation:** `https://bicycle-shop-backend-jqz7.onrender.com/docs`

---

## ✅ Testing

I have added a small sample of testing, follow the setup instructions in the backend repository.

### Run Unit & Integration Tests

```sh
npm run test
```

---

## 📂 Project Structure

```plaintext

📦 src
 ┣ 📂 api             # API calls and services
 ┣ 📂 assets          # Static assets (images, icons, etc.)
 ┣ 📂 components      # Reusable UI components
 ┣ 📂 helpers         # Utility functions and custom hooks
 ┣ 📂 screens         # Page-level components
 ┃ ┣ 📂 Admin         # Admin dashboard views
 ┃ ┣ 📂 Clients       # Client-facing views
 ┣ 📂 store           # State management (Zustand)
 ┣ 📂 test            # Unit and integration tests
 ┣ 📜 App.css         # Global styles
 ┣ 📜 App.tsx         # Main App component
 ┣ 📜 index.css       # Base CSS styles
 ┣ 📜 index.html      # Entry HTML file
 ┣ 📜 main.tsx        # Main entry point for React
 ┣ 📜 vite-env.d.ts   # Vite environment types
 ┣ 📜 README.md       # Project documentation


```

## ⚖️ Trade-offs and Development Decisions

### **State Management: Zustand instead of Redux**

- Chose **Zustand** due to its **simpler API and lightweight nature**.
- Redux offers more scalability but requires more boilerplate.

### **Testing: Vitest instead of Jest**

- Since the project uses **Vite**, **Vitest** was chosen for better integration and speed.

### **Real-Time Updates: WebSockets with Socket.IO**

- Enables **real-time product updates**.
- **Trade-off:** Requires **careful event handling** to avoid unnecessary re-renders.

### **API Handling: Axios for API Calls**

- Chose **Axios** for **better error handling and built-in interceptors**.
- API base URL is **configured dynamically** via Vite’s configuration (no `.env` file needed).

### **Accessibility Enhancements**

- Implemented **ARIA roles and labels** for screen reader support.
- Added **live announcements** for loading states and real-time updates.

---

## 🎯 Key Challenges and Solutions

### **1️⃣ Performance Optimization: Lag in Product Loading**

- **Problem:** Noticeable lag when filtering or navigating between products.
- **Solution:** Used **`useMemo`** and **`React.memo`** to optimize filtering and sorting.

### **2️⃣ Real-Time Data: Product Updates**

- **Problem:** Product availability and attributes were not updating instantly.
- **Solution:** Integrated **WebSockets (Socket.IO)** to enable real-time updates efficiently.

### **3️⃣ State Management Efficiency**

- **Problem:** Redux would introduce unnecessary complexity for this project.
- **Solution:** Used **Zustand** for a **simpler, modular** state management approach.

### **4️⃣ Component Reusability**

- **Solution:** Created reusable components such as **Filters** and **Modals** to follow DRY principles.

### **5️⃣ Dynamic Product Restrictions**

- **Problem:** Certain configurations required dynamic constraints based on user selections.
- **Solution:** Backend was updated to support **dynamic validation rules** for product restrictions.

### **6️⃣ Dynamic Filters**

- **Problem:** The administrator might want to expand the store to sell products beyond bicycles in the future.
- **Solution:** Implemented **a dynamic and flexible filtering system** to accommodate new product types without requiring code changes.

### **7️⃣ Preventing Crashes from Undefined or Empty Data**

- **Problem:** Some components were crashing when API responses returned `undefined` or empty values.
- **Solution:** Implemented **defensive programming** by ensuring:
  - Default values for missing data (`?? ''` or `{}` where applicable).
  - Conditional rendering (`data ? <Component /> : <Fallback />`).
  - Handling optional chaining (`data?.attribute`).

This approach ensures a **fast, responsive, crash-free**, and **user-friendly** application. 🚀

---

## 🚀 Future Improvements

### **1️⃣ Enhance Real-Time Features**

- Implement **optimistic updates** to improve perceived performance.
- Add **real-time notifications** for stock changes or promotions.

### **2️⃣ Improve Performance and Scalability**

- Implement **pagination or infinite scrolling** for large product catalogs.
- Optimize WebSocket event handling to **reduce unnecessary updates**.

### **3️⃣ Better User Experience & Accessibility**

- Add **dark mode support** for improved UX.
- Enhance **keyboard navigation** and refine ARIA attributes.
- **Include product images** in both the **admin panel** and **customer store** for a better user experience.

### **4️⃣ More Advanced Filtering & Sorting**

- Allow users to **save filters** for future sessions.
- Add **multi-category filtering** to refine searches more effectively.

### **5️⃣ Admin Panel Enhancements**

- Develop an **admin dashboard** for managing inventory and orders.
- Integrate **bulk import/export features** for product data.
- Implement **accounting tools**, including revenue tracking, special offers, discounts, and sales statistics.
- Display **best-selling product combinations**, featured products, and active promotions to customers.
- Add a **newsletter system** for communication with registered users.

### **6️⃣ Authentication & User Accounts**

- Implement **optional user authentication** to allow:
  - Saving favorite products.
  - Storing past purchases.
  - Personalized recommendations.

### **7️⃣ Improve Test Coverage**

- Expand **end-to-end (E2E) testing** with Cypress or Playwright.
- Increase **unit test coverage** across the entire app to reach **65-80% minimum**.

🔗 **Frontend Repository:** [Bicycle Shop - Frontend](https://github.com/Btojaka/bicycle-shop-frontend)  
🔗 **Backend Repository:** [Bicycle Shop - Backend](https://github.com/Btojaka/bicycle-shop-backend)

## 📌 Autor

🚀 _Desarrollado por \*\*[Btojaka](https://github.com/Btojaka)_

## 🙌 Thanks for reading!
