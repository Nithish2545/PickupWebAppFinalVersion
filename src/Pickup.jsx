import { useEffect, useState } from "react";
import Runsheet from "./Runsheet";
import PickupCompleted from "./PickupCompleted";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckPickup } from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [currentTab, setCurrentTab] = useState("RUN SHEET");
  const navigate = useNavigate();
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Clear user data from localStorage upon sign-out
        localStorage.removeItem("userData");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      const pickupCollection = collection(db, "LoginCredentials"); // Reference to the 'Pickup' collection
      try {
        const snapshot = await getDocs(pickupCollection); // Fetch
        const result = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); // Map to a usable format
        setUserName(result[0][auth.currentUser.email][0]);
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
    fetchData();
  }, []);

  const fetchData = () => {
    const pickupCollection = collection(db, "pickup"); // Reference to the 'pickup' collection
    try {
      // Listen for real-time updates
      const unsubscribe = onSnapshot(
        pickupCollection,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })); // Map to a usable format
          setUserData(data); // Set the fetched data to state
        },
        (error) => {
          // Handle errors
          if (error.message.includes("Network")) {
            setError("Network error. Please check your connection.");
          } else {
            setError(`Error: ${error.message}`);
          }
        }
      );

      // Return the unsubscribe function to stop listening when needed
      return unsubscribe;
    } catch (error) {
      setError(`Unexpected error: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userName]);

  const currentItems = userData.filter(
    (user) => user.status == "RUN SHEET" && user.pickUpPersonName === userName
  );

  const incomingManifestItems = userData.filter(
    (user) =>
      [
        "INCOMING MANIFEST",
        "PAYMENT PENDING",
        "PAYMENT DONE",
        "SHIPMENT CONNECTED",
      ].includes(user.status) && user.pickUpPersonName === userName
  );

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Sign out and tab title */}
      <div className="flex justify-between items-center bg-white p-4 shadow-md">
        <h1 className="text-lg font-semibold">
          {[
            "INCOMING MANIFEST",
            "PAYMENT PENDING",
            "PAYMENT DONE",
            "SHIPMENT CONNECTED",
          ].includes(currentTab)
            ? "PICKUP COMPLETED"
            : currentTab}
        </h1>
        <button
          className="px-4 py-2 bg-purple-700 text-white font-bold rounded shadow-md hover:bg-purple-800"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-around bg-gray-50 p-4 border-b border-gray-300">
        <button
          className={`text-xl ${
            currentTab === "RUN SHEET" ? "text-purple-700" : "text-gray-500"
          }`}
          onClick={() => handleTabChange("RUN SHEET")}
        >
          <FontAwesomeIcon icon={faTruckPickup} />
        </button>
        <button
          className={`text-xl ${
            currentTab === "INCOMING MANIFEST"
              ? "text-purple-700"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("INCOMING MANIFEST")}
        >
          <FontAwesomeIcon icon={faCheckCircle} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border text-purple-700" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div>
            {currentTab === "RUN SHEET" ? (
              <Runsheet userData={currentItems} />
            ) : currentTab === "INCOMING MANIFEST" ? (
              <PickupCompleted userData={incomingManifestItems} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
