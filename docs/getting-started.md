# Getting Started

Follow these steps to get your development environment ready for contributing to the project.

## Prerequisites

- **Node.js**: Version 18.x or later.
- **npm**: Version 8.x or later.
- **Git**: For version control.
- **Azure Subscription**: Required for the Speech API (Free tier works great).

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

## Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION
   ```

3. **Run for Development**:
   - **Chrome**: `npm run dev`
   - **Firefox**: `npm run dev:firefox`
   
   **Note**: If you are using a restricted environment (like Flatpak or Snap), WXT may not be able to launch the browser for you. If it fails with a "File path cannot be resolved" error, please refer to the [Manual Loading Guide](testing.md#b-manual-load-unpacked-restricted-environments--flatpak--snap).

   WXT provides **HMR (Hot Module Replacement)**, meaning most changes to the UI or background scripts will reflect immediately.


## Documentation Index

- [Architecture Guide](architecture.md)
- [Configuration Guide](configuration.md)
- [Development Guide](development.md)
- [Testing & Verification Guide](testing.md)
