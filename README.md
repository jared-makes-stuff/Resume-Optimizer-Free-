# LinkedIn Profile Optimizer and Resume Generator

## Project Overview

The LinkedIn Profile Optimizer is a robust, client-side web application designed to help professionals transform their exported LinkedIn Profile PDFs into fully customizable, highly optimized profiles. It extracts the raw data, allows for extensive local editing, and ultimately generates a professionally formatted LaTeX resume. It also interfaces with advanced generative features, such as generating tailored prompts to fine-tune your resume bullet points.

The core goal of this project is to provide users full sovereignty over their professional data. There is no backend database persisting user information; all parsing and modifications process securely within the browser and persist locally via browser storage.

## Key Features

1. **Local PDF Parsing**
   - The application ingests standard LinkedIn Profile data exports (in PDF format).
   - Utilizing advanced client-side PDF parsing mechanisms, it systematically traverses the document to extract structured sections including professional experience, education, and detailed project participation.

2. **Interactive Profile Editor**
   - Once data is extracted, it is loaded into a comprehensive Profile Editor.
   - Users can dynamically add, remove, and refine their experiences and educational background.
   - For users who prefer a more technical approach, there is an integrated JSON viewer and editor to manipulate the internal data structure directly.

3. **LaTeX Resume Generation**
   - Based on the refined profile data, the application generates a complete LaTeX document.
   - The generated LaTeX code adheres to professional typesetting standards and can be directly compiled in any popular LaTeX environment (such as Overleaf or local TeX installations) to produce a flawless, ATS-friendly PDF resume.

4. **Job Matching and Prompt Engineering**
   - The application provides a suite to cross-reference the generated resume with potential job descriptions.
   - It outputs tailored prompts that users can input into Large Language Models to receive specialized advice, cover letters, and keyword optimizations.

5. **Theme Support**
   - The interface features seamless switching between light and dark modes, integrated at the root level for an optimal reading and working experience across different system preferences.

## Architecture and Build

This application is built as a Single Page Application (SPA), emphasizing modern frontend development practices.

### Core Technology Stack
- **React 18**: Serves as the fundamental declarative view layer.
- **Vite**: The build tool and development server, chosen for its exceptional module replacement speed and optimized production bundling.
- **Tailwind CSS 4**: Used for rapid, utility-first styling. The configuration avoids bulky runtime evaluation by resolving styles during the build process.
- **Framer Motion**: Integrated to provide fluid, high-performance interface animations and layout transitions.
- **Radix UI**: Provides the foundational, accessible, and unstyled primitives for complex interactive components (such as Tabs and Dialogs).

### Client-Side Parsing
- **PDF.js (pdfjs-dist)**: Handles the binary reading of the uploaded LinkedIn PDF export. The application maps specific text nodes to infer the structural layout of the user's profile.

### State Management
- React context and local component state handle the momentary modifications during the session.
- `localStorage` is implemented to serialize the complex object structure, ensuring that the profile data persists securely across browser sessions without needing external authentication or databases.

## Local Development Setup

To establish a local development environment, ensure you have Node.js installed on your system.

1. **Clone the Repository**
   Download the project structure to your local machine.

2. **Install Dependencies**
   Navigate to the `frontend` directory (where the application core resides) and install the necessary Node modules.
   ```bash
   cd frontend
   npm install
   ```

3. **Launch the Development Server**
   Initiate the Vite development server to view the application in the browser.
   ```bash
   npm run dev
   ```
   The application will become accessible, typically at `http://localhost:5173`.

4. **Production Build**
   To prepare the application for deployment, generate the optimized, static assets.
   ```bash
   npm run build
   ```
   The output artifacts will be available in the `dist` directory, ready to be served by any static file hosting service.

## Project Structure

- `frontend/src/`
  - `components/`: Contains the modular UI building blocks (Profile Editor, Resume Generator).
  - `pages/`: Houses the top-level route components (Landing Page).
  - `services/`: Encapsulates business logic, such as the PDF parsing algorithms and local storage adapters.
  - `lib/`: Provides strictly typed utilities and formatting helpers (such as the LaTeX generation logic).

## Privacy and Security Notes

Because the primary input involves sensitive personal information (a user's full work history and educational timeline), this application explicitly restricts all data processing to the client side. There are no API calls offloading PDF text to external servers for initial parsing. Security is handled inherently by containing the execution context strictly to the immediate browser process.
