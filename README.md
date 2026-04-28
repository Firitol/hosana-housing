# Hosana Nexus: City Housing Management System

Hosana Nexus is a comprehensive housing management system designed for Hosana City's administrative bodies. It provides officials at the Mayor, Sub-city, and Kebele levels with a powerful, map-based platform to register, track, and manage housing records throughout the city.

## 🌟 Key Features

*   **Centralized Dashboard:** Get a high-level overview of housing statistics, recent activities, and AI-powered administrative briefs.
*   **Comprehensive Housing Records:** A complete data table of all registered houses, with powerful search and filtering capabilities.
*   **GIS-Powered Map View:** Visualize all housing records on an interactive map. Features include marker clustering, detailed info-windows, and advanced filtering by administrative divisions.
*   **Data Management:** Easily add new houses one-by-one through a detailed form (with map-based location picking) or perform bulk imports via CSV uploads.
*   **Role-Based Access:** The system is built with security in mind, ready to support different roles and permissions for various administrative levels.
*   **Audit Logging:** Track all major actions within the system for full accountability and transparency.
*   **Multi-language Support:** User interface supports both English and Amharic, based on user preference.
*   **Progressive Web App (PWA):** The application is fully installable on desktop and mobile devices for a native-app experience.

## 🛠️ Tech Stack

*   **Frontend:** Next.js, React, TypeScript
*   **UI:** ShadCN UI, Tailwind CSS, Recharts (for charts), Lucide Icons
*   **Maps:** Google Maps API, integrated with `@vis.gl/react-google-maps` and `use-supercluster` for high-performance clustering.
*   **Backend & Database:** Firebase (Firestore for database, Firebase Authentication for user management).
*   **Generative AI:** Google's Gemini model via Genkit for AI-powered summaries.

## 🚀 Getting Started

The application is set up to work with Firebase. After running the project, you can start by:

1.  **Registering a new user account.** New users are assigned a "Kebele Officer" role by default.
2.  **Navigating to the Dashboard** to see an overview of the system.
3.  **Exploring the "Housing" page** to see a list of all registered houses.
4.  **Using the "Map View"** for a geographical perspective on the housing data.
5.  **Adding a new house** using the form on the "Housing" page.

This project was bootstrapped and developed in **Firebase Studio**.
