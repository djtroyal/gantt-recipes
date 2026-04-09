import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { RecipePage } from './pages/RecipePage';
import { EditorPage } from './pages/EditorPage';
import { MultiCookPage } from './pages/MultiCookPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:slug" element={<RecipePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:slug" element={<EditorPage />} />
          <Route path="/multi-cook" element={<MultiCookPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
