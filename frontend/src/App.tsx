import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'

// Placeholders — replace as each page gets built.
const Stub = ({ name }: { name: string }) => <h1>{name}</h1>

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="search" element={<Stub name="Search results" />} />
              <Route path="restaurants/:restPhone" element={<Stub name="Restaurant" />} />
              <Route path="book" element={<Stub name="Confirm booking" />} />
              <Route path="reservations" element={<Stub name="My reservations" />} />
              <Route path="reservations/:resNum" element={<Stub name="Reservation" />} />
              <Route path="login" element={<Stub name="Log in" />} />
              <Route path="signup" element={<Stub name="Sign up" />} />
              <Route path="staff" element={<Stub name="Today" />} />
              <Route path="staff/availability" element={<Stub name="Availability" />} />
              <Route path="*" element={<Stub name="Not found" />} />
            </Route>
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
