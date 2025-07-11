
---

# InvoiceStock

**InvoiceStock** is a full-featured invoicing and inventory management SaaS platform tailored for small to medium-sized businesses. It includes support for barcode scanning, real-time stock updates, multi-currency invoicing, role-based dashboards, and dynamic reports. Built with **React**, **Next.js**, **Firebase**, and **Stripe**, it delivers a complete frontend experience for retail and wholesale workflows.

---

## ✨ Features

* Inventory management with stock alerts and categorization  
* Barcode scanner integration for adding and editing products  
* Multi-currency invoice generation with downloadable PDFs  
* Role-based dashboards for Admin, Staff, and Cashier  
* Secure authentication with Clerk and Firebase  
* Stripe integration for invoice payments and customer billing  
* Realtime dashboard stats using Firebase Firestore  
* Clean UI built with Tailwind CSS and Shadcn components  
* Jest-based unit tests for core frontend components  
* Vercel CI/CD setup with preview and production environments

---

## 🧱 Folder Structure

* `src/components/` – Shared components like Modals, Inputs, and Tables  
* `src/pages/` – All invoice, product, dashboard, and auth views  
* `src/lib/` – Utility functions, Firebase setup, and Stripe logic  
* `src/styles/` – Tailwind config and global CSS  
* `firebase.config.ts` – Firestore, Auth, and Realtime DB setup  
* `middleware.ts` – Auth guards and protected routes

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repository

```

git clone [https://github.com/LaeeqtheDev/invoicestock.git](https://github.com/LaeeqtheDev/invoicestock.git)
cd invoicestock

```

### 2. Install dependencies

```

npm install

```

### 3. Add environment variables

Create a `.env.local` file and include the following:

```

NEXT\_PUBLIC\_FIREBASE\_API\_KEY=your\_key
NEXT\_PUBLIC\_FIREBASE\_AUTH\_DOMAIN=your\_auth\_domain
NEXT\_PUBLIC\_FIREBASE\_PROJECT\_ID=your\_project\_id
NEXT\_PUBLIC\_STRIPE\_PUBLIC\_KEY=your\_stripe\_public\_key
FIREBASE\_ADMIN\_SDK\_PRIVATE\_KEY=your\_firebase\_admin\_key
STRIPE\_SECRET\_KEY=your\_stripe\_secret

```

### 4. Run the development server

```

npm run dev

```

Visit [http://localhost:3000](http://localhost:3000) to access the app.

---

## 💼 Use Cases

* Small retail or wholesale businesses managing stock  
* Freelancers and agencies generating custom invoices  
* Shops with POS and barcode workflows  
* Companies that need downloadable and emailed invoices  

---

## 🧑 Author

Built by [Syed Laeeq Ahmed](https://www.linkedin.com/in/syed-laeeq-ahmed/)

* 📬 Email: [laeeqahmed656@gmail.com](mailto:laeeqahmed656@gmail.com)  
* 🧑‍💻 GitHub: [github.com/LaeeqtheDev](https://github.com/LaeeqtheDev)

---

## 🌍 Deployment

* Frontend hosted on [Vercel](https://vercel.com)  
* Firebase handles backend auth, storage, and Firestore  
* Stripe powers all billing and payment integrations  

---

## 📄 License

This project is open-source for learning and non-commercial use only. For commercial licensing or white-label solutions, please contact the author directly.

---
