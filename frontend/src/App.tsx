import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext'
import Layout from './components/layout/Layout'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import RestaurantDetail from './pages/RestaurantDetail'
import Login from './pages/Login'
import BookingConfirm from './pages/BookingConfirm'
import MyReservations from './pages/MyReservations'
import ReservationDetail from './pages/ReservationDetail'
import Signup from './pages/Signup'
import StaffToday from './pages/StaffToday'
import StaffAvailability from './pages/StaffAvailability'
import NotFound from './pages/NotFound'

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
              <Route path="restaurants/:restPhone" element={<RestaurantDetail />} />

              {/* Booking carries its state in the URL so it survives
                  the round trip through login. */}
              <Route
                path="restaurants/:restPhone/book"
                element={
                  <RequireAuth>
                    <BookingConfirm />
                  </RequireAuth>
                }
              />

              <Route
                path="reservations"
                element={
                  <RequireAuth>
                    <MyReservations />
                  </RequireAuth>
                }
              />
              <Route
                path="reservations/:resNum"
                element={
                  <RequireAuth>
                    <ReservationDetail />
                  </RequireAuth>
                }
              />

              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />

              <Route
                path="staff"
                element={
                  <RequireAuth>
                    <StaffToday />
                  </RequireAuth>
                }
              />
              <Route
                path="staff/availability"
                element={
                  <RequireAuth>
                    <StaffAvailability />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
