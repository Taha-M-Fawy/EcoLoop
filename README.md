# EcoLoop 🔄🌱
### Community Resource Sharing & Circular Marketplace

**EcoLoop** is a full-stack community web platform built using the **MEAN stack** to reduce waste and encourage sustainable living. The system connects community members to repurpose usable items through three flexible options: **Free Donations**, **Item Bartering**, and **Affordable Direct Sales**.

The application follows clean coding standards, a modular project structure, and meets all core requirements of the capstone evaluation.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Angular (Reactive Forms, Components, Routing, RxJS) |
| **Backend** | Node.js & Express.js (REST API, Clean Controllers & Routes) |
| **Database** | MongoDB & Mongoose (Schema Modeling & Validation) |
| **Authentication** | User Sessions, JWT, and Role Handling (Admin / User) |
| **UI & Styling** | Responsive Layouts, Dynamic Forms, and Loading States |

---

## 🚀 Key Modules & Capabilities

- **User Access & Roles:**
  - Standard registration and login flows.
  - Role separation between regular community members and administrators for item moderation and category management.
- **Dynamic Listing Pipeline (Full CRUD):**
  - Full CRUD operations supporting three listing types:
    - 🎁 **Donation:** Direct giveaways to support community members.
    - 🔁 **Barter:** Direct exchanges of items without monetary exchange.
    - 🏷️ **Sale:** Low-cost sales to extend product lifecycles.
- **Input Validation:**
  - Client-side checks with Angular Reactive Forms to ensure data integrity.
  - Server-side validations via Mongoose schemas before persisting data.
- **Error Handling & UX States:**
  - Centralized API error handling for predictable server responses.
  - Clear user feedback including loading indicators and operational alerts.
- **Code Organization:**
  - Clean separation of concerns across routes, controllers, models, and shared UI components.

---

## 👥 Development Team (Team 5)

* **Mostafa Mahmoud Mohamed Selim**
* **Taha Mohammed Fawy Ahmed**
* **Marco Moris Mousa Zakhary**
* **Elzahraa Gamal Abdelrahman Mahmoud**
* **Rahma Mohamed Ragab Abdelrahman**

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)
- Angular CLI

### Backend Setup
```bash
cd backend
npm install
npm run start
