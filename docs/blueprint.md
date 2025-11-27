# **App Name**: Nusantara OSIS Hub

## Core Features:

- Personalized Dynamic Dashboard: Displays relevant information, tasks, and statistics based on user's position within OSIS. The Ketua OSIS's dashboard shows a command center map of all ongoing OSIS activities with real-time progress, and pending task counts. The Wakil Ketua OSIS's dashboard is focused on monitoring synchronization among divisions.
- AI Briefing: AI provides morning briefings to key members like the Ketua OSIS, summarizing pending approvals, division progress, and sentiment analysis from public forums.  This feature acts as a tool to quickly inform decision-making.
- Document Management with AI Notulen: Secretaries can upload audio recordings of meetings, and AI automatically transcribes and creates draft meeting minutes.
- Workflow Automation: Automates tasks based on triggers (e.g., approval of an event proposal triggers notifications and task assignments).
- Role-Based Access Control: Access to features and data is determined by the user's position within OSIS, from Pengurus Inti to Anggota Divisi.
- Task Management System: Allows for task creation, assignment (to specific member UIDs), monitoring (status updates: pending, in-progress, completed, overdue), and prioritization (low, medium, high, urgent).
- Cloud Firestore Integration: Stores user data, tasks, workflows, and reports in a structured manner within Cloud Firestore, ensuring data integrity and scalability. Follows structure of users, tasks, workflows, and reports collections.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082), symbolizing wisdom and leadership, reflecting the strategic nature of the Digital Command Center.
- Background color: Light Lavender (#E6E6FA), a desaturated tint of the primary, providing a calming and sophisticated backdrop.
- Accent color: Golden Yellow (#FFD700), used sparingly for key CTAs and highlights, representing the value and prestige of the OSIS organization.
- Headline font: 'Playfair', a modern sans-serif, will provide an elegant, fashionable feel; Body font: 'PT Sans' will make longer text readable. The font combination will present an intellectual and leadership based persona.
- Code font: 'Source Code Pro' for displaying code snippets and system messages.
- Custom icons that reflect OSIS activities and divisions, designed with a consistent, modern style. Framer Motion will handle all UI animations to present smooth transitions between user interactions.
- Subtle micro-interactions and animations to enhance user experience and provide feedback. Incorporate Lottie Files for interactive illustrations.