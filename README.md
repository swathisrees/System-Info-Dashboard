# System Info Monitor

A modern, beautiful Electron application for real-time system monitoring built with React, Tailwind CSS v4, and shadcn/ui components.

## Features

### 🎨 Modern UI Design
- **Clean, minimalist interface** with beautiful gradients and shadows
- **Dark/Light mode support** with automatic theme detection
- **Responsive design** that works on all screen sizes
- **Smooth animations** and transitions for better user experience
- **Professional color scheme** with proper contrast and accessibility

### 📊 Real-time System Monitoring
- **CPU Usage** with status indicators (Good/Moderate/High)
- **Memory Usage** with detailed breakdown
- **System Uptime** tracking
- **Platform Information** display
- **Load Average** history (1, 5, 15 minute averages)

### 🛠 Technical Stack
- **Electron** for cross-platform desktop app
- **React 19** with TypeScript
- **Tailwind CSS v4** for modern styling
- **shadcn/ui** components for consistent design
- **Lucide React** icons for beautiful visual elements

## UI Components Used

- **Card** - Main content containers with hover effects
- **Button** - Interactive elements with loading states
- **Progress** - Visual progress indicators
- **Badge** - Status indicators with color coding
- **Separator** - Visual dividers for content organization
- **Accordion** - Collapsible content sections
- **Alert** - Error and warning messages

## Design Features

### Color Scheme
- **Light Mode**: Clean whites and blues with subtle gradients
- **Dark Mode**: Deep slates and purples for reduced eye strain
- **Status Colors**: 
  - 🟢 Green for "Good" status
  - 🟡 Amber for "Moderate" status  
  - 🔴 Red for "High" status

### Animations
- **Fade-in effects** for cards with staggered delays
- **Hover transitions** for interactive elements
- **Loading spinners** for refresh operations
- **Smooth progress bars** with color transitions

### Layout
- **Grid-based responsive design** (1-4 columns based on screen size)
- **Proper spacing** using Tailwind's spacing scale
- **Visual hierarchy** with typography and color
- **Card-based information architecture**

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## System Requirements

- Node.js 18+ 
- npm or yarn
- Windows, macOS, or Linux

## Architecture

The application uses Electron's main/renderer process model:

- **Main Process** (`src/main.ts`): Handles system metrics collection
- **Renderer Process** (`src/renderer.tsx`): React UI components
- **Preload Script** (`src/preload.ts`): Secure IPC communication
- **UI Components** (`src/components/ui/`): shadcn/ui components

## Contributing

This project uses modern development practices:
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS v4 for styling
- shadcn/ui for component consistency

## License

MIT License - see package.json for details 