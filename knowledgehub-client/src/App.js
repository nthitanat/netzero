import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthFlowProvider } from './contexts/AuthFlowContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/Navbar/Navbar';
import Footer from './components/common/Footer/Footer';
import Landing from './pages/Landing/Landing';
import About from './pages/About/About';
import Communities from './pages/Communities/Communities';
import CommunityDetail from './pages/CommunityDetail/CommunityDetail';
import Showroom from './pages/Showroom/Showroom';
import Courses from './pages/Courses/Courses';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AuthFlowProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/communities/:slug" element={<CommunityDetail />} />
                  <Route path="/showroom" element={<Showroom />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:id" element={<CourseDetail />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthFlowProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
