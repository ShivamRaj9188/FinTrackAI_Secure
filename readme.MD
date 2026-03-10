# Fintack AI Project

This repository contains the source code for the Fintack AI project. The project is structured into two main parts: a modern React-based application and a collection of basic HTML/CSS/JS files.

## Project Structure

The workspace is organized as follows:

```
.
├── BasicCode/              # Basic HTML, CSS, and JavaScript files
├── frontendpart/           # Main React application
│   ├── src/                # Source code for the React app
│   ├── public/             # Public assets
│   ├── package.json        # Project dependencies and scripts
│   └── vite.config.js      # Vite configuration
└── readme.MD               # This file
```

-   **`BasicCode/`**: This directory contains a set of static web pages. These might be initial mockups, prototypes, or a separate static site. You can open the `.html` files directly in a browser to view them.

-   **`frontendpart/`**: This is the main application, built with React, Vite, and Tailwind CSS. It includes features like user authentication, dashboards, and more.

## Running the Main Application

To run the main React application located in the `frontendpart` directory, follow these steps:

### Prerequisites

-   [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

### Setup and Execution

1.  **Navigate to the frontend directory:**
    Open your terminal and change to the `frontendpart` directory.

    ```bash
    cd frontendpart
    ```

2.  **Install dependencies:**
    Install the necessary Node.js packages defined in `package.json`.

    ```bash
    npm install
    ```

3.  **Start the development server:**
    This command will start the Vite development server, and you can view the application in your browser.

    ```bash
    npm run dev
    ```

    The application will typically be available at `http://localhost:5173`.

### Key Dependencies

This project relies on several key libraries. While `npm install` will install all of them, here are the commands to install them individually:

-   **GSAP (GreenSock Animation Platform):** For animations.
    ```bash
    npm install gsap
    ```

-   **Chart.js:** For creating charts, including pie charts.
    ```bash
    npm install chart.js
    ```

-   **Tailwind CSS with PostCSS and Autoprefixer:** For styling.
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    ```

### Other Available Scripts

-   **`npm run build`**: To create a production build of the application. The output will be in the `dist` folder.
-   **`npm run lint`**: To run the ESLint linter on the project files.
-   **`npm run preview`**: To preview the production build locally.
