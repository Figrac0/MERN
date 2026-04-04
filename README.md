# Your Places

---

<div align="center">
  <a href="https://mern-your-place.vercel.app/" target="_blank">
    <img
      src="https://github.com/Figrac0/Figrac0/blob/main/href.svg"
      alt="Quick Access - Visit Site"
      width="50%"
    />
  </a>
</div>

---


Your Places is a full-stack MERN application for collecting, organizing, and exploring real places. It allows people to create an account, upload a profile photo, save places with images and addresses, browse other users' collections, open locations on a map, and get suggestions through an in-app travel assistant.

---

## 📸 Project Preview

<div align="center">
  
| 1 |
| :---: |
| <img src="https://github.com/Figrac0/MERN/blob/MERN/gitres/1g.gif" width="700"/> |


| 2 |
| :---: |
| <img src="https://github.com/Figrac0/MERN/blob/MERN/gitres/2g.gif" width="700"/> |

</div>

<div align="center">
  <details>
    <summary><strong>Show images</strong></summary>
    <br/>

| 1 | 2 |
| :---: | :---: |
| <img src="https://github.com/Figrac0/MERN/blob/MERN/gitres/1.png" width="600"/> | <img src="https://github.com/Figrac0/MERN/blob/MERN/gitres/2.png" width="600"/> |
| <img src="https://github.com/Figrac0/MERN/blob/MERN/gitres/3.png" width="600"/> | <img src="https://github.com/Figrac0/MERN/blob/MERN/gitres/4.png" width="600"/> |

  </details>
</div>

---


The project is built as a separated frontend and backend:

- `mernFront` is the React client
- `mernBack` is the Express + MongoDB API

The application is designed to work well in two different environments:

- **Local development** with a live Ollama-powered assistant
- **Cloud deployment** on Vercel with MongoDB Atlas and Cloudinary

When Ollama is not available, the assistant still works in a graceful fallback mode using the real places already stored in the application.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Main Features](#main-features)
- [User Experience and Pages](#user-experience-and-pages)
- [Architecture Overview](#architecture-overview)
- [Frontend](#frontend)
- [Backend](#backend)
- [How Frontend and Backend Work Together](#how-frontend-and-backend-work-together)
- [Authentication Flow](#authentication-flow)
- [Places Flow](#places-flow)
- [AI Assistant](#ai-assistant)
- [Image and Media Storage](#image-and-media-storage)
- [Database Models](#database-models)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deploying to Vercel](#deploying-to-vercel)
- [Project Structure](#project-structure)
- [Why This Project Is Interesting](#why-this-project-is-interesting)

---

## Product Overview

At its core, Your Places is a curated city guide built by real users.

Instead of being just another CRUD demo, the application is shaped around a more product-like idea:

- people build personal collections of places
- the community can explore those collections
- every place has context: title, description, address, image, map location, and owner
- the app can guide discovery with a built-in assistant

The project combines practical utility and stronger presentation:

- a personalized account area
- a shared community directory
- a modern home page
- persistent authentication
- rich media uploads
- recommendation logic
- optional live AI integration

This makes it suitable not only as a learning project, but also as a portfolio project that demonstrates product thinking, UX work, backend architecture, deployment planning, and AI-assisted interaction.

<div align="center">
  
 <img src="https://github.com/Figrac0/MERN/blob/MERN/gitres/MERN.png" width="700"/> 

</div>

---

## Main Features

- User registration and login with hashed passwords and JWT authentication
- Persistent login state on the frontend with automatic token expiration handling
- User profile images
- Place creation with image upload, title, description, and address
- Automatic geocoding of addresses into map coordinates
- Interactive map modal for each place
- Community page for exploring other users
- Personal collection page with filtering and sorting
- Edit and delete controls only for the place owner
- Smart assistant area on the home page
- Local live assistant support through Ollama
- Static built-in recommendation mode when live AI is unavailable
- Cloudinary-based image storage for Vercel-friendly deployment
- MongoDB Atlas-ready backend architecture
- Vercel-ready split deployment for frontend and backend

---

## User Experience and Pages

### Home

The home page is the public entry point of the product.

It introduces the purpose of the application, shows quick high-level metrics, highlights active cities and featured places, and includes the in-app travel assistant. The assistant can answer questions like:

- which places are worth visiting first
- what addresses are already saved
- what type of place should be added next
- what exists in a certain city

### Community

The community page lists user profiles and turns the app into a social discovery experience rather than a private notebook. It includes:

- quick activity statistics
- profile search
- sorting by activity or name
- direct access to each user's saved places

### My Places / User Places

This page is both a personal dashboard and a public collection view.

If the current visitor is the owner, they can:

- review their saved places
- add new places
- filter and sort the collection
- edit and delete existing entries

If the visitor is looking at another user's collection, the page behaves as a read-only public profile.

### Add Place

The new place page is a guided creation flow. It includes:

- validated inputs
- image upload
- a live preview card
- a readiness checklist before submission

This makes place creation feel more deliberate and polished than a plain form.

### Edit Place

The edit page allows the owner of a place to update its textual information while keeping the existing address and image. It also includes a preview panel and checklist.

### Authentication

The authentication page supports:

- sign up
- sign in
- profile image upload during sign up
- password validation
- clear user-facing messaging

The page is intentionally presented as part of the product experience, not just as a raw technical auth screen.

---

## Architecture Overview

The project is split into two independently deployable applications:

```text
React frontend  <----HTTP---->  Express API  <---->  MongoDB
       |                              |
       |                              +----> Cloudinary
       |
       +----> Leaflet + OpenStreetMap tiles
       |
       +----> Optional local AI via backend bridge
                               |
                               +----> Ollama (OpenAI-compatible endpoint)
```

### Architectural goals

- Keep the frontend focused on UX, rendering, routing, and input handling
- Keep the backend responsible for validation, authorization, persistence, and integrations
- Make image storage work in both local development and cloud deployment
- Keep AI optional, not required for the product to remain useful
- Support a clean Vercel deployment with frontend and backend as separate projects

---

## Frontend

The frontend lives in `mernFront`.

### Frontend stack

- React `16.11.0`
- React DOM
- React Router DOM `5.3.4`
- React Transition Group
- Create React App / React Scripts `5`
- Custom hooks for form and HTTP management
- Plain CSS with component-level styling
- Leaflet loaded from CDN for map rendering

### Frontend responsibilities

The frontend is responsible for:

- page routing
- authentication state on the client
- form state and validation feedback
- network requests to the backend
- rendering map modals, cards, and navigation
- deciding whether the assistant is in live or fallback mode

### Routing

The main routing setup is in [App.js](mernFront/src/App.js).

Routes currently include:

- `/` -> Home page
- `/community` -> Community directory
- `/:userId/places` -> Public or personal collection
- `/places/new` -> Create place, only for authenticated users
- `/places/:placeId` -> Edit place, only for authenticated users
- `/auth` -> Authentication page, only for guests

### Client-side authentication state

Authentication is stored in React state and synchronized with `localStorage`.

The frontend stores:

- `token`
- `userId`
- `userImage`
- `expiration`

This means:

- users remain signed in after refresh
- the UI knows who owns which place
- the navigation can show a small avatar
- the app can automatically log out when the token expires

### Shared frontend utilities

Important frontend building blocks include:

- [http-hook.js](mernFront/src/shared/hooks/http-hook.js)
  Handles fetch requests, loading state, error state, abort logic, and safer response parsing.

- [form-hook.js](mernFront/src/shared/hooks/form-hook.js)
  Handles form field state and validity.

- [url.js](mernFront/src/shared/util/url.js)
  Centralizes backend API URL creation and asset URL normalization.

- [place-insights.js](mernFront/src/shared/util/place-insights.js)
  Powers the static assistant mode, place categorization, discovery insights, top cities, and collection suggestions.

### Maps

The frontend uses Leaflet through [Map.js](mernFront/src/shared/components/UIElements/Map.js).

Behavior:

- Leaflet is loaded from CDN in [index.html](mernFront/public/index.html)
- OpenStreetMap tiles are used for rendering
- coordinates come from the backend geocoding step
- each place can be opened inside a modal map view

### Image uploads

On the frontend, image selection happens through [ImageUpload.js](mernFront/src/shared/components/FormElements/ImageUpload.js).

It provides:

- local image preview before submission
- accepted formats: `.jpg`, `.jpeg`, `.png`
- integration with the shared form hook

---

## Backend

The backend lives in `mernBack`.

### Backend stack

- Node.js `22`
- Express `4`
- Body Parser
- Mongoose
- MongoDB Atlas-ready connection strategy
- bcryptjs for password hashing
- jsonwebtoken for auth tokens
- express-validator for request validation
- multer for file uploads
- axios for address geocoding requests

### Backend responsibilities

The backend is responsible for:

- validating incoming data
- authenticating protected requests
- authorizing ownership-based actions
- talking to MongoDB
- geocoding place addresses
- uploading and deleting images
- bridging the app to Ollama

### App entry point

The server entry file is [app.js](mernBack/app.js).

It handles:

- JSON parsing
- database connection middleware
- CORS setup
- route mounting
- static image serving for local fallback mode
- centralized error handling
- Vercel-safe export of the Express app

### Database connection

The MongoDB connection logic is isolated in [db.js](mernBack/util/db.js).

It:

- builds a MongoDB Atlas connection string from environment variables
- caches the active Mongoose connection promise
- prevents repeated reconnect logic on serverless cold starts or multiple imports

### Validation and security

Validation is performed through `express-validator` in the route layer before controller logic runs.

Examples:

- sign up requires name, email, password, and image
- place creation requires title, description, address, and image
- updates require valid title and description

Protected routes use [check-auth.js](mernBack/middleware/check-auth.js), which:

- reads the `Authorization` header
- expects a Bearer token
- verifies the JWT using `JWT_KEY`
- attaches `req.userData.userId` for downstream authorization checks

### Ownership rules

The backend protects write operations:

- a user can only create a place for their own account
- a user can only edit their own place
- a user can only delete their own place

This is enforced in [places-controllers.js](mernBack/controllers/places-controllers.js).

---

## How Frontend and Backend Work Together

This application uses a clean request-response flow between a decoupled React client and an Express API.

### URL strategy

The frontend never hardcodes request URLs directly in page components. Instead, it uses [url.js](mernFront/src/shared/util/url.js).

This gives two benefits:

- easier local development
- easier deployment to Vercel

For example:

- local API base: `http://localhost:5000/api`
- deployed API base: `https://your-backend.vercel.app/api`

### Request flow example

When a user creates a place:

1. The React form collects title, description, address, image, and current user ID
2. The frontend sends a `multipart/form-data` request to `POST /api/places`
3. The backend checks the JWT
4. The backend validates fields
5. The backend geocodes the address
6. The backend uploads the image
7. The backend writes the place to MongoDB
8. The backend links the place to the owning user
9. The frontend redirects the user back to their collection

This same separation exists across sign up, sign in, editing, deleting, community loading, and assistant requests.

---

## Authentication Flow

Authentication is implemented with JWT and a client-side persistence layer.

### Sign up

During sign up:

1. The frontend sends `FormData` with `name`, `email`, `password`, and `image`
2. The backend validates the request
3. The password is hashed with `bcryptjs`
4. The profile image is stored
5. A `User` document is created in MongoDB
6. A JWT token is generated
7. The frontend stores the token and user metadata in `localStorage`

### Login

During login:

1. The frontend sends email and password as JSON
2. The backend fetches the user by email
3. The password is checked against the hash
4. A JWT is returned
5. The frontend restores the signed-in state

### Persistent sessions

The React app restores the session on page reload by reading `userData` from `localStorage`. It also tracks the expiration date and sets a timer to log the user out automatically when the token becomes invalid.

This behavior lives in [App.js](mernFront/src/App.js).

---

## Places Flow

The place lifecycle is one of the central parts of the project.

### Creating a place

Backend steps:

- validate title, description, address
- verify JWT owner
- geocode address with Nominatim
- upload image to Cloudinary if configured
- otherwise store locally in `uploads/images`
- create `Place`
- push the place reference into the owning `User`

### Viewing places

Users can view:

- a single place by ID
- all places owned by a specific user

The frontend then renders:

- cards
- metadata chips
- a map modal
- edit/delete controls when the viewer is also the owner

### Updating a place

The update route edits textual data only:

- `title`
- `description`

Address, coordinates, and image remain unchanged in the current implementation.

### Deleting a place

Deletion is transactional from the product perspective:

- the place is removed from MongoDB
- the user-place relationship is cleaned up
- the stored image is deleted from Cloudinary or local storage

---

## AI Assistant

One of the more distinctive parts of the project is the built-in assistant on the home page.

### Two operating modes

The assistant has two modes:

1. **Live AI mode**
2. **Built-in fallback mode**

### Live AI mode

When running locally with Ollama, the frontend calls:

- `GET /api/assistant/status`
- `POST /api/assistant/chat`

The backend controller in [assistant-controller.js](mernBack/controllers/assistant-controller.js):

- reads the configured Ollama/OpenAI-compatible endpoint
- sanitizes the current user and place data
- builds a compact context block
- sends a `chat/completions` request
- returns the assistant reply to the frontend

The system prompt tells the model to:

- respond in natural English
- stay user-facing
- use only the provided data
- recommend saved places when possible
- avoid mentioning internal implementation details

### Built-in fallback mode

If Ollama is unavailable, slow, or absent, the app still keeps the assistant useful.

The fallback logic lives in [place-insights.js](mernFront/src/shared/util/place-insights.js).

It can:

- infer place categories
- extract city names from addresses
- rank stronger places
- suggest what kinds of places are missing
- answer simple recommendation and address questions

This means the chat area remains functional even on Vercel, where local Ollama is not available.

### Why this design matters

This hybrid approach makes the project more serious and more practical:

- it demonstrates real AI integration
- it remains deployable
- it does not break when live LLM access is missing
- it keeps the feature valuable in production

---

## Image and Media Storage

Image handling is built to support both local development and cloud deployment.

### Current storage strategy

The storage layer lives in [asset-storage.js](mernBack/util/asset-storage.js).

It supports two modes:

- **Cloudinary mode** when Cloudinary credentials are configured
- **Local fallback mode** when Cloudinary is not configured

### Cloudinary mode

In Cloudinary mode:

- multer uses memory storage
- the backend signs upload requests itself
- the file is uploaded to Cloudinary
- the place or user stores:
  - image URL
  - Cloudinary `public_id`

Cloudinary is the recommended mode for Vercel deployment.

### Local fallback mode

If Cloudinary is not configured:

- multer stores the file in `mernBack/uploads/images`
- the file path is saved in the database
- Express serves the folder statically

This mode is useful for fast local development, but it is not the right final strategy for Vercel because serverless file systems are not meant for durable user uploads.

### Image deletion

When a place is deleted:

- if the image has a Cloudinary `public_id`, the backend destroys it remotely
- otherwise the backend deletes the local file

### Migration of old local images

The project includes a migration script:

[migrate-images-to-cloudinary.js](mernBack/scripts/migrate-images-to-cloudinary.js)

Its job is to:

- find existing database records with local image paths
- upload those images to Cloudinary
- replace the stored image path with a remote Cloudinary URL
- store the new `imagePublicId`

This is especially useful when moving an older local project to Vercel.

---

## Database Models

### User

Defined in [user.js](mernBack/models/user.js)

Fields:

- `name`
- `email`
- `password`
- `image`
- `imagePublicId`
- `places`

The `places` field stores references to `Place` documents.

### Place

Defined in [place.js](mernBack/models/place.js)

Fields:

- `title`
- `description`
- `image`
- `imagePublicId`
- `address`
- `location.lat`
- `location.lng`
- `creator`

This structure allows:

- full place cards
- image rendering
- map rendering
- ownership checks
- populated user-place relationships

---

## API Overview

### User routes

Defined in [users-routes.js](mernBack/routes/users-routes.js)

- `GET /api/users`
- `POST /api/users/signup`
- `POST /api/users/login`

### Place routes

Defined in [places-routes.js](mernBack/routes/places-routes.js)

- `GET /api/places/:pid`
- `GET /api/places/user/:uid`
- `POST /api/places`
- `PATCH /api/places/:pid`
- `DELETE /api/places/:pid`

Protected routes require a Bearer token.

### Assistant routes

Defined in [assistant-routes.js](mernBack/routes/assistant-routes.js)

- `GET /api/assistant/status`
- `POST /api/assistant/chat`

---

## Environment Variables

### Root Node version

The project is currently aligned to Node `22.12.0`, reflected by the root [.nvmrc](.nvmrc).

### Backend environment

Example backend environment variables are documented in [mernBack/.env.example](mernBack/.env.example).

Typical backend configuration:

```env
MONGO_USER=
MONGO_PASSWORD=
MONGO_CLUSTER=
MONGO_DB=
JWT_KEY=

CLOUDINARY_URL=
CLOUDINARY_FOLDER=your-places

OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.1:8b
```

The backend also supports split Cloudinary variables instead of `CLOUDINARY_URL`:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=your-places
```

### Frontend environment

Example frontend variables are documented in [mernFront/.env.example](mernFront/.env.example).

Typical frontend configuration:

```env
REACT_APP_BACKEND_URL=http://localhost:5000/api
REACT_APP_ASSET_URL=http://localhost:5000
```

When images are stored in Cloudinary, the app can still work well because the stored image URLs are already absolute.

---

## Local Development

### 1. Use the correct Node version

```bash
nvm use 22.12.0
```

### 2. Install frontend dependencies

```bash
cd mernFront
npm install
```

### 3. Install backend dependencies

```bash
cd ../mernBack
npm install
```

### 4. Configure environment variables

Create local `.env` files for frontend and backend based on the example files.

### 5. Start the backend

```bash
cd mernBack
npm start
```

### 6. Start the frontend

```bash
cd mernFront
npm start
```

### 7. Optional: run the live assistant locally

Start Ollama and make sure your model is available, for example:

```bash
ollama list
ollama pull llama3.1:8b
```

If Ollama is reachable at `http://localhost:11434/v1`, the assistant can switch into live mode.

---

## Deploying to Vercel

The recommended deployment is:

- one Vercel project for `mernBack`
- one Vercel project for `mernFront`

### Why two separate Vercel projects

This mirrors the actual architecture:

- the backend is an API service
- the frontend is a client application

It also makes environment management much cleaner.

### Backend on Vercel

Root directory:

```text
mernBack
```

Key points:

- [vercel.json](mernBack/vercel.json) rewrites all requests to `app.js`
- the Express app is exported instead of always listening directly
- MongoDB Atlas should be used as the database
- Cloudinary should be used for user and place images

Suggested backend environment variables on Vercel:

```env
MONGO_USER=
MONGO_PASSWORD=
MONGO_CLUSTER=
MONGO_DB=
JWT_KEY=

CLOUDINARY_URL=
CLOUDINARY_FOLDER=your-places
```

You can omit the Ollama variables in production if you only want the fallback assistant there.

### Frontend on Vercel

Root directory:

```text
mernFront
```

Key points:

- [vercel.json](mernFront/vercel.json) rewrites all routes to `index.html`
- this preserves client-side routing for React Router

Suggested frontend environment variables on Vercel:

```env
REACT_APP_BACKEND_URL=https://your-backend-project.vercel.app/api
REACT_APP_ASSET_URL=https://your-backend-project.vercel.app
```

If your images are fully stored in Cloudinary, `REACT_APP_ASSET_URL` becomes less important because Cloudinary image URLs are already absolute.

### Production behavior of the assistant

On Vercel:

- the live Ollama assistant is usually not available
- the built-in place helper still works
- the UI clearly indicates when the user is in fallback mode

### Migration before deployment

If you created images locally before switching to Cloudinary, run:

```bash
cd mernBack
npm run migrate:cloudinary
```

This ensures older local images are moved to Cloudinary before production deployment.

---

## Project Structure

```text
MERN/
├── mernFront/
│   ├── public/
│   ├── src/
│   │   ├── home/
│   │   ├── places/
│   │   ├── shared/
│   │   └── user/
│   ├── package.json
│   └── vercel.json
├── mernBack/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   ├── util/
│   ├── app.js
│   ├── package.json
│   └── vercel.json
└── README.md
```

### Frontend folders

- `home/` -> landing page and assistant
- `places/` -> place pages and place components
- `shared/` -> reusable components, hooks, utilities, auth context
- `user/` -> auth page, users directory, user cards

### Backend folders

- `controllers/` -> business logic
- `middleware/` -> auth and upload middleware
- `models/` -> Mongoose schemas
- `routes/` -> route definitions
- `scripts/` -> migration and maintenance scripts
- `util/` -> database connection, geocoding, asset storage

---

## Why This Project Is Interesting

This project stands out because it combines several layers that are often shown separately but rarely tied together cleanly in one application:

- a modern React interface
- a real Express + MongoDB API
- authentication with protected ownership rules
- media upload and media lifecycle management
- geocoding and map visualization
- user discovery and community browsing
- AI-assisted interaction
- Vercel-ready deployment thinking

It is also interesting because the AI integration is not just decorative. The assistant is connected to actual app data, and when live AI is not available the feature still degrades gracefully into a useful product behavior instead of simply breaking.

That makes Your Places more than a tutorial project. It shows how a full-stack product can be designed to feel thoughtful, useful, and deployment-aware from end to end.
