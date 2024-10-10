import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"; // Import react-hook-form

const SignIn = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm();

  const validUsers = [
    { email: "pravin@gmail.com", password: "pravinshiphit_30" , name:"pravin" },
    { email: "sathish@gmail.com", password: "sathish@123" , name:"sathish" }, 
    { email: "sangeetha@gmail.com", password: "sangeethaShiphit_23" , name:"sangeetha" },
    { email: "jaga@gmail.com", password: "jagashiphit" , name:"jaga" },
  ];

  // Form submit handler
  const onSubmit = (data) => {

    setLoading(true);
    setAuthError("");

    const validUser = validUsers.find(
      (user) => user.email === data.email && user.password === data.password
    );

    if (validUser) {
      setLoading(false);
      // Store user info in localStorage
      const result = validUsers.filter(
        (user) => user.email === data.email && user.password === data.password
      )
    console.log(result)
      localStorage.setItem("userData", JSON.stringify(result));
      // Navigate to home page
      navigate("/pickup");
    } else {
      setLoading(false);
      setAuthError("Invalid email or password.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 p-6 h-screen">
      <img src="/assets/image.png" className="h-16 mb-6" alt="Logo" />
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign In</h1>
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <input
              type="email"
              className={`w-full h-12 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 focus:outline-none focus:border-purple-500`}
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-red-500 mt-2">{errors.email.message}</p>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              className={`w-full h-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 focus:outline-none focus:border-purple-500`}
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-red-500 mt-2">{errors.password.message}</p>}
          </div>
          {authError && <p className="text-red-500 mt-2">{authError}</p>}
          <button
            type="submit"
            className={`w-full h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center ${loading ? 'opacity-50' : ''}`}
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
      {/* <div className="mt-4">
        <button
          className="text-purple-600 underline"
          onClick={() => alert("Forgot Password pressed")}
        >
          Forgot your password?
        </button>
      </div> */}
    </div>
  );
};

export default SignIn;