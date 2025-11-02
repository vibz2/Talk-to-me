import { Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import TherapistShowcase from './components/TherapistShowcase';
import ChatPage from './components/ChatPage.jsx';

export default function App() {
  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#2B2B2B] font-sans">
      <Routes>
        {/* Home route */}
        <Route path="/" element={
          <>
            <Hero />
            <TherapistShowcase />
          </>
        } />     
        <Route path="/chat/:therapyMode" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

