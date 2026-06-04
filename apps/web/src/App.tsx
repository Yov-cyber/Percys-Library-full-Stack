import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Library } from './pages/Library';
import { Reader } from './pages/Reader';
import { NotFound } from './pages/NotFound';
import { useTheme } from './hooks/useTheme';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppRoutes() {
  useTheme();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/reader/:comicId" element={
          <ErrorBoundary fallbackTitle="Error en el lector">
            <Reader />
          </ErrorBoundary>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
