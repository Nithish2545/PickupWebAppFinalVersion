import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { auth, db } from "./firebase"; // Import Firebase auth instance
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

const SignIn = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [LoginCredentials, setLoginCredentials] = useState({});
  // react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Form submit handler
  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError("");
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      const fetchData = async () => {
        const pickupCollection = collection(db, "LoginCredentials"); // Reference to the 'Pickup' collection
        try {
          const snapshot = await getDocs(pickupCollection); // Fetch
          const result = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })); // Map to a usable format
          return result[0][data.email][0];
        } catch (error) {
          if (error.message.includes("Network")) {
            // setError("Network error. Please check your connection.");
          } else {
            // setError(`Error: ${error.message}`);
          }
        } finally {
          // setLoading(false);
        }
      };
      // Store user info in localStorage
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: await fetchData(),
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      // Navigate to home page
      navigate("/pickup");
    } catch (error) {
      setAuthError(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 p-6 h-screen">
      <img src="/assets/image.png" className="h-16 mb-6" alt="Logo" />
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Sign In
      </h1>
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <input
              type="email"
              className={`w-full h-12 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 focus:outline-none focus:border-purple-500`}
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 mt-2">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-4">
            <input
              type="password"
              className={`w-full h-12 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 focus:outline-none focus:border-purple-500`}
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-red-500 mt-2">{errors.password.message}</p>
            )}
          </div>
          {authError && <p className="text-red-500 mt-2">{authError}</p>}
          <button
            type="submit"
            className={`w-full h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center ${
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="font-semibold text-lg">Loading...</span>
            ) : (
              <span className="font-semibold text-lg">Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
