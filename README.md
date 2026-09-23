# Smart Campus Shuttle Management System (MoveInSync Portal)

A full-stack, interview-friendly transit dispatch and passenger booking platform built for managing campus shuttles, driver shifts, hourly availability timelines, and real-time ride lifecycles.

---

## 1. Project Overview
The **Smart Campus Shuttle Management System** streamlines campus transit operations by bridging passenger ride requests with admin dispatch workflows. Employees can book shuttle trips, track active rides, and review trip history. Transport Admins can dispatch drivers and vehicles, manage duty shifts, schedule breaks, and monitor hourly timeline availability across campus routes.

---

## 2. Key Features

### Employee Workspace
- **Shuttle Booking**: Simple booking form selecting campus routes, pickup/drop-off locations, and requested pickup times.
- **Current Ride Card**: Live view of active bookings (`REQUESTED`, `ACCEPTED`, `ON_GOING`) displaying assigned driver, vehicle details, planned drop times, and status badges.
- **Trip History**: Comprehensive table of previous and active bookings with search and status filtering (`REQUESTED`, `ACCEPTED`, `ON_GOING`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
- **Booking Cancellation**: Self-service cancellation for upcoming rides in `REQUESTED` or `ACCEPTED` status with confirmation safeguards.

### Transport Admin Workspace
- **Admin Dashboard**: Overview metrics and quick navigation cards to dispatch operations.
- **Booking Dispatch Management**: Interactive drawer for assigning drivers, vehicles, and routes.
- **Status Lifecycle Control**: Dispatch state machine transitions (`REQUESTED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `ON_GOING` $\rightarrow$ `COMPLETED`), plus marking `NO_SHOW` or `CANCELLED`.
- **Driver Timeline & Gantt View**: 24-hour visual gantt track showing driver status (`ONLINE`, `ON_DUTY`, `OFFLINE`), shift duty hours, break periods, and pickup/drop counts.
- **Shift & Break Scheduling**: Modals to set duty shift hours (`dutyStart < dutyEnd`) and add driver breaks (`breakStart < breakEnd`).
- **Route Management**: Full CRUD interface for campus routes, specifying pickup locations, drop locations, and estimated travel times.
- **Driver Management**: Driver directory with form validation for creating drivers and updating status.

### Authentication & Role Protection
- Role-aware frontend routing restricting `/admin/*` to transport admins and `/employee/*` to campus employees.
- Clean authentication API (`POST /api/auth/login`) with BCrypt password verification and HTTP 401 handling.
- Demo quick login triggers for instant demonstration during interviews.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router v6
- **HTTP Client**: Axios (configured with `baseURL: http://localhost:8080/api`)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with modern cards, glassmorphism badges, and responsive gantt grids.

### Backend
- **Framework**: Java 21 / Spring Boot 3.3.4
- **Persistence**: Spring Data JPA (Hibernate)
- **Database**: MySQL 8.x
- **Utilities**: Lombok, Jackson JSON

---

## 4. Architecture

```
+-------------------------------------------------------------+
|                      React Frontend                         |
|  (Vite Dev Server @ http://localhost:5173)                 |
|  [LoginPage] [AdminDashboard] [AdminBookings] [AdminDrivers]|
|  [AdminRoutes] [EmployeeBookPage] [EmployeeHistoryPage]    |
+------------------------------+------------------------------+
                               |
                   REST HTTP / JSON Axios
                               |
+------------------------------v------------------------------+
|                    Spring Boot Backend                      |
|  (Embedded Tomcat Server @ http://localhost:8080/api)       |
|  [AuthController]  [BookingController] [DriverController]   |
|  [RouteController] [VehicleController]                      |
+------------------------------+------------------------------+
                               |
                       Spring Data JPA
                               |
+------------------------------v------------------------------+
|                     MySQL Database                          |
|  Tables: users, drivers, vehicles, routes,                  |
|          driver_schedules, driver_breaks, bookings          |
+-------------------------------------------------------------+
```

---

## 5. Database Entities

1. **User (`users`)**:
   - `id` (PK, Long)
   - `name` (String)
   - `email` (String, Unique)
   - `password` (String)
   - `empId` (String)
   - `role` (Enum: `ADMIN`, `EMPLOYEE`)

2. **Driver (`drivers`)**:
   - `id` (PK, Long)
   - `name` (String)
   - `phone` (String)
   - `rating` (Double)
   - `status` (Enum: `ONLINE`, `ON_DUTY`, `OFFLINE`)

3. **Vehicle (`vehicles`)**:
   - `id` (PK, Long)
   - `licensePlate` (String)
   - `vehicleCode` (String)
   - `model` (String)
   - `capacity` (Integer)

4. **Route (`routes`)**:
   - `id` (PK, Long)
   - `name` (String)
   - `pickupLocation` (String)
   - `dropLocation` (String)
   - `estimatedMinutes` (Integer)

5. **DriverSchedule (`driver_schedules`)**:
   - `id` (PK, Long)
   - `driver_id` (FK to Driver)
   - `scheduleDate` (LocalDate)
   - `dutyStart` (LocalTime)
   - `dutyEnd` (LocalTime)

6. **DriverBreak (`driver_breaks`)**:
   - `id` (PK, Long)
   - `driver_schedule_id` (FK to DriverSchedule)
   - `breakStart` (LocalTime)
   - `breakEnd` (LocalTime)

7. **Booking (`bookings`)**:
   - `id` (PK, Long)
   - `bookingIdDisplay` (String)
   - `employee_id` (FK to User)
   - `driver_id` (FK to Driver, Nullable)
   - `vehicle_id` (FK to Vehicle, Nullable)
   - `route_id` (FK to Route)
   - `requestedPickupTime` (LocalDateTime)
   - `actualPickupTime` (LocalDateTime, Nullable)
   - `plannedDropTime` (LocalDateTime, Nullable)
   - `actualDropTime` (LocalDateTime, Nullable)
   - `status` (Enum: `REQUESTED`, `ACCEPTED`, `ON_GOING`, `COMPLETED`, `CANCELLED`, `NO_SHOW`)

---

## 6. Main REST APIs

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user credentials and return user profile & role |
| `GET` | `/api/bookings` | Retrieve all shuttle bookings |
| `GET` | `/api/bookings/{id}` | Get specific booking details |
| `POST` | `/api/bookings` | Create new passenger booking (`REQUESTED`) |
| `PUT` | `/api/bookings/{id}` | Update booking driver/vehicle assignment (`ACCEPTED`) |
| `POST` | `/api/bookings/{id}/sign-in` | Sign in rider and start trip (`ON_GOING`) |
| `POST` | `/api/bookings/{id}/complete` | Complete shuttle trip (`COMPLETED`) |
| `POST` | `/api/bookings/{id}/cancel` | Cancel booking (`CANCELLED`) |
| `POST` | `/api/bookings/{id}/no-show` | Mark rider as no-show (`NO_SHOW`) |
| `GET` | `/api/drivers` | List all drivers with duty status |
| `GET` | `/api/drivers/{id}` | Get driver schedule details and breaks |
| `POST` | `/api/drivers` | Create new driver |
| `PUT` | `/api/drivers/{id}` | Update driver status |
| `POST` | `/api/drivers/{id}/schedule` | Set driver duty shift schedule |
| `POST` | `/api/drivers/{id}/schedule/{sId}/breaks` | Add break period to driver schedule |
| `GET` | `/api/routes` | List all campus routes |
| `POST` | `/api/routes` | Create new campus route |
| `PUT` | `/api/routes/{id}` | Update existing route |

---

## 7. Project Structure

```
Shuttle-Management-System/
├── shuttle-management-backend/
│   ├── src/main/java/com/shuttlemanagement/
│   │   ├── config/          # DataInitializer (Seed Data)
│   │   ├── controller/      # Auth, Booking, Driver, Route, Vehicle Controllers
│   │   ├── dto/             # Request & Response DTOs
│   │   ├── entity/          # JPA Entities & Enums
│   │   ├── exception/       # ResourceNotFound, BadRequest, Unauthorized Exceptions
│   │   ├── repository/      # Spring Data Repositories
│   │   └── service/         # Business Logic Services
│   └── pom.xml
├── shuttle-management-frontend/
│   ├── src/
│   │   ├── api/             # Axios client instance (baseURL: http://localhost:8080/api)
│   │   ├── components/      # Sidebar, Navbar, StatusBadge, BookingDrawer, Modals
│   │   ├── pages/           # Admin & Employee Pages
│   │   ├── App.jsx          # Protected Routes & Role Guards
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 8. How to Setup & Run

### Prerequisites
- Java JDK 21+
- Maven 3.8+
- Node.js 18+ and npm
- MySQL Server 8.0+

### Database Setup
1. Create a MySQL database named `shuttle_db`:
   ```sql
   CREATE DATABASE shuttle_db;
   ```
2. Database credentials can be configured using environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`) or defaults in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:shuttle_db}
   spring.datasource.username=${DB_USERNAME:root}
   spring.datasource.password=${DB_PASSWORD:}
   spring.jpa.hibernate.ddl-auto=update
   ```

### Running the Backend
```bash
cd shuttle-management-backend
mvn spring-boot:run
```
The Spring Boot backend will run on `http://localhost:8080` and populate initial demo seed data automatically.

### Running the Frontend
```bash
cd shuttle-management-frontend
npm install
npm run dev
```
The React frontend will be accessible at `http://localhost:5173`.

---

## 9. Sample Development Login Credentials

| Role | Email | Password | Emp ID |
| :--- | :--- | :--- | :--- |
| **Transport Admin** | `admin@example.com` | `admin123` | `EMP-001` |
| **Campus Employee** | `employee@example.com` | `emp123` | `123123` |

---

## 10. Screenshots Section

> [!NOTE]
> Screenshots illustrating the booking form, trip history, admin dispatch drawer, and driver availability gantt timeline can be viewed when running the frontend application locally.

---

## 11. Future Improvements
- Mobile application view optimization for iOS & Android.
- Automated driver shift assignment optimization based on booking demand density.
- Exporting trip logs and fleet metrics to PDF/CSV.
