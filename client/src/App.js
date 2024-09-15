import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'font-awesome/css/font-awesome.min.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from './components/header/header.component';
import Review from './components/review/review.component';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/review" replace />} />
          <Route path='/review' element={<Review/>}/>
        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
