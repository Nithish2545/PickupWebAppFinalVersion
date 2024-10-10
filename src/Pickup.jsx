import { useEffect, useState } from "react";
import axios from "axios";
import Runsheet from "./Runsheet";
import apiURLs from "../utility/apiURLs";
import PickupCompleted from "./PickupCompleted";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckPickup } from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [userName, setUserName] = useState("");
  const API_URL = apiURLs.sheetDB;
  const [currentTab, setCurrentTab] = useState("RUN SHEET");
  const navigate = useNavigate();
  const handleSignOut = () => {
    signOut(FIREBASE_AUTH)
      .then(() => {
        console.log("Sign-out successful.");
        // Clear user data from localStorage upon sign-out
        localStorage.removeItem("userData");
        localStorage.removeItem("authToken");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const local_S_userData = localStorage.getItem("userData");
        if (local_S_userData) {
          setUserName(JSON.parse(local_S_userData)[0].name);
        console.log(JSON.parse(local_S_userData)[0].name)

        } else {
          console.log("No data found for key 'userData'");
        }
      } catch (e) {
        console.error("Failed to load data from localStorage", e);
      }
    };
    fetchData();
  }, []);

  const fetchAssignments = async () => {
    try {
      const result = await axios.get(API_URL);
      const assignmentsData = result.data.sheet1.reduce((acc, item) => {
        acc[item.awbNumber] = item.pickUpPersonName;
        return acc;
      }, {});
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error fetching assignments from Google Sheets:", error);
    }
  };

  useEffect(() => {
    const fetchUserRole = () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const user = JSON.parse(token);
          setUserRole(user.role);
        }
      } catch (error) {
        console.error("Error fetching user role from localStorage:", error);
      }
    };
    fetchUserRole();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await axios.get(API_URL);
      setUserData(result.data.sheet1);
      await fetchAssignments();
    } catch (error) {
      if (error.response) {
        setError(
          `Error ${error.response.status}: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const currentItems = userData.filter(
    (user) => user.status === "RUN SHEET" && user.pickUpPersonName === String( userName)
  );

  const incomingManifestItems = userData.filter(
    (user) =>
      ["INCOMING MANIFEST", "PAYMENT PENDING", "PAYMENT DONE", "SHIPMENT CONNECTED"].includes(user.status) &&
      user.pickUpPersonName === userName
  );

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Sign out and tab title */}
      <div className="flex justify-between items-center bg-white p-4 shadow-md">
      <h1 className="text-lg font-semibold">
  {["INCOMING MANIFEST", "PAYMENT PENDING", "PAYMENT DONE", "SHIPMENT CONNECTED"].includes(currentTab) ? "PICKUP COMPLETED" : currentTab}
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
            currentTab === "INCOMING MANIFEST" ? "text-purple-700" : "text-gray-500"
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
