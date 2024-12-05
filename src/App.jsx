import { Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth
import SignIn from './Signin';
import Pickup from './Pickup';
import PickupDetails from './PickupDetails';

// ProtectedRoute Component
function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null); // null indicates loading state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user); // Set to true if user is logged in, otherwise false
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isAuth === null) {
    // Optional: Add a loading spinner while checking auth status
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// SignIn Component Redirect Logic
function SignInRedirect() {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user); // Set to true if user is logged in
    });

    return () => unsubscribe();
  }, []);

  if (isAuth === null) {
    // Optional: Show a loading spinner
    return <div>Loading...</div>;
  }

  if (isAuth) {
    return <Navigate to="/pickup" replace />;
  }

  return <SignIn />;
}

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<SignInRedirect />} />

      {/* Protected Routes */}
      <Route
        path="/pickup"
        element={
          <ProtectedRoute>
            <Pickup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pickupdetails/:awbNumber"
        element={
          <ProtectedRoute>
            <PickupDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;