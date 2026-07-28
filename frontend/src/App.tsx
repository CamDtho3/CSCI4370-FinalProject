import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext'
import Layout from './components/layout/Layout'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import RestaurantDetail from './pages/RestaurantDetail'
import Login from './pages/Login'

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
              <Route path="restaurants/:restPhone" element={<RestaurantDetail />} />

              {/* Booking carries its state in the URL so it survives
                  the round trip through login. */}
              <Route
                path="restaurants/:restPhone/book"
                element={
                  <RequireAuth>
                    <Stub name="Confirm booking" />
                  </RequireAuth>
                }
              />

              <Route
                path="reservations"
                element={
                  <RequireAuth>
                    <Stub name="My reservations" />
                  </RequireAuth>
                }
              />
              <Route
                path="reservations/:resNum"
                element={
                  <RequireAuth>
                    <Stub name="Reservation" />
                  </RequireAuth>
                }
              />

              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Stub name="Sign up" />} />

              <Route
                path="staff"
                element={
                  <RequireAuth>
                    <Stub name="Today" />
                  </RequireAuth>
                }
              />
              <Route
                path="staff/availability"
                element={
                  <RequireAuth>
                    <Stub name="Availability" />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<Stub name="Not found" />} />
            </Route>
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
