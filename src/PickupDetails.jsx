import { useEffect, useState } from "react";
import axios from "axios";
import apiURLs from "../utility/apiURLs";
import { useNavigate, useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./FirebaseConfig";

const API_URL = apiURLs.sheety;

const PickupDetails = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [packageWeightImages, setPackageWeightImages] = useState([]);
  const [formImages, setFormImages] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pickupWeight, setPickupWeight] = useState("");
  const [numberOfPackages, setNumberOfPackages] = useState(1);
  const { awbNumber } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const result = await axios.get(API_URL);
        const userDetails = result.data.sheet1.find(
          (item) =>
            item.status === "RUN SHEET" &&
            item.awbNumber === parseInt(awbNumber)
        );
        setDetails(userDetails);
        setPickupWeight(userDetails?.pickupWeight || "");
        setNumberOfPackages(userDetails?.numberOfPackages || 1);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [awbNumber]);

  const uploadFileToFirebase = async (file, folder) => {
    const response = await fetch(file);
    const blob = await response.blob();
    const storageRef = ref(storage, `${awbNumber}/${folder}/${file.name}`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleFileChange = (folder, setState) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (event) => {
      const files = Array.from(event.target.files);
      setState((prevFiles) => [...prevFiles, ...files]);
    };
    input.click();
  };

  const handleRemoveFile = (fileName, setState) => {
    setState((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const validateForm = () => {
    if (!pickupWeight || !numberOfPackages) {
      setError("Pickup weight and number of packages are required.");
      return false;
    }
    if (productImages.length === 0 || productImages.length > 5) {
      setError("You must upload between 1 to 5 product images.");
      return false;
    }
    if (packageWeightImages.length === 0 || packageWeightImages.length > 5) {
      setError("You must upload between 1 to 5 package weight images.");
      return false;
    }
    if (formImages.length === 0 || formImages.length > 2) {
      setError("You must upload between 1 to 2 form images.");
      return false;
    }
    setError("");
    return true;
  };

  const PickupCompletedDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const istTime = now
      .toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        hour12: true,
      })
      .toUpperCase();
    return `${day}-${month} & ${istTime}`;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);

    try {
      if (!details) {
        throw new Error("User details not found");
      }

      const productImageUrls = await Promise.all(
        productImages.map((file) =>
          uploadFileToFirebase(file, "PRODUCT IMAGES")
        )
      );
      const packageWeightImageUrls = await Promise.all(
        packageWeightImages.map((file) =>
          uploadFileToFirebase(file, "PACKAGE WEIGHT")
        )
      );
      const formImageUrls = await Promise.all(
        formImages.map((file) => uploadFileToFirebase(file, "FORM IMAGES"))
      );

      await axios.put(`${API_URL}/${details.id}`, {
        sheet1: {
          postPickupWeight: `${pickupWeight} KG`,
          postNumberOfPackages: numberOfPackages,
          status: "INCOMING MANIFEST",
          pickUpPersonNameStatus: "PICKUP COMPLETED",
          PRODUCTSIMAGE: productImageUrls.join(", "),
          PACKAGEWEIGHTIMAGES: packageWeightImageUrls.join(", "),
          FORMIMAGES: formImageUrls.join(", "),
          pickupCompletedDatatime: PickupCompletedDate(),
        },
      });
      navigate("/pickup");
      resetForm();
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      setError(
        `Error ${error.response.status}: ${
          error.response.data.message || error.message
        }`
      );
    } else {
      setError(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setPickupWeight("");
    setNumberOfPackages(1);
    setProductImages([]);
    setPackageWeightImages([]);
    setFormImages([]);
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <button
        onClick={() => window.history.back()}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded mb-5 transition duration-200"
      >
        Back
      </button>
      {details ? (
        <div>
          <h1 className="text-4xl font-bold mb-6 text-purple-700">
            Pickup Details
          </h1>
          <div className="mb-4 p-4 flex flex-col gap-2 bg-white rounded-lg shadow-md">
            <h3 className="font-semibold text-lg">
              AWB Number:{" "}
              <span className="font-normal">{details.awbNumber}</span>
            </h3>
            <h3 className="font-semibold text-lg">
              Consignor:{" "}
              <span className="font-normal">{details.consignorname}</span>
            </h3>
            <h3 className="font-semibold text-lg">
              Destination:{" "}
              <span className="font-normal">{details.destination}</span>
            </h3>
            <h3 className="font-semibold text-lg">
              Weight Approx:{" "}
              <span className="font-normal">{details.weightapx}</span>
            </h3>
            <h3 className="font-semibold text-lg">
              Consignor Phone Number:{" "}
              <span className="font-normal">
                {details.consignorphonenumber}
              </span>
            </h3>
            <h3 className="font-semibold text-lg">
              Pickup Datetime:{" "}
              <span className="font-normal">{details.pickupDatetime}</span>
            </h3>
            <h3 className="font-semibold text-lg">
              Pickup Instructions:{" "}
              <span className="font-normal">
                {details.pickupInstructions == ""
                  ? " N/A"
                  : details.pickupInstructions}
              </span>
            </h3>
          </div>
          <div className="mb-5 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Update Details</h2>
            <h3 className="mr-4 text-lg">Enter Pickup weight:</h3>
            <input
              type="text"
              placeholder="Enter Pickup Weight"
              value={pickupWeight}
              onChange={(e) => setPickupWeight(e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring focus:ring-purple-400"
            />
            <div className="flex items-center mt-4">
              <h3 className="mr-4 text-lg">No. of boxes:</h3>
              <button
                onClick={() =>
                  setNumberOfPackages(Math.max(1, numberOfPackages - 1))
                }
                className="bg-purple-500 text-white rounded px-5 py-2 transition-transform duration-200 transform hover:scale-105"
              >
                -
              </button>
              <input
                type="number"
                value={numberOfPackages}
                onChange={(e) =>
                  setNumberOfPackages(Math.max(1, parseInt(e.target.value, 10)))
                }
                className="border border-gray-300 mx-2 p-2 rounded w-20 text-center focus:outline-none focus:ring focus:ring-purple-400"
              />
              <button
                onClick={() => setNumberOfPackages(numberOfPackages + 1)}
                className="bg-purple-500 text-white rounded px-5 py-2 transition-transform duration-200 transform hover:scale-105"
              >
                +
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="mb-5 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Upload Files</h2>
            <div className="my-3">
              <h3 className="text-lg font-semibold">
                Product Images ( 1 - 5 )
              </h3>
              <button
                onClick={() =>
                  handleFileChange("PRODUCT IMAGES", setProductImages)
                }
                className="bg-purple-500 text-white rounded px-4 py-2 mb-2 transition duration-200 hover:bg-purple-600"
              >
                Add Image
              </button>
              {productImages.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-2"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() =>
                      handleRemoveFile(file.name, setProductImages)
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="my-3">
              <h3 className="text-lg font-semibold">Package Weight Images ( 1 - 5 )</h3>
              <button
                onClick={() =>
                  handleFileChange("PACKAGE WEIGHT", setPackageWeightImages)
                }
                className="bg-purple-500 text-white rounded px-4 py-2 mb-2 transition duration-200 hover:bg-purple-600"
              >
                Add Image{" "}
              </button>
              {packageWeightImages.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-2"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() =>
                      handleRemoveFile(file.name, setPackageWeightImages)
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="my-3">
              <h3 className="text-lg font-semibold">Form Images ( 1 - 2 )</h3>
              <button
                onClick={() => handleFileChange("FORM IMAGES", setFormImages)}
                className="bg-purple-500 text-white rounded px-4 py-2 mb-2 transition duration-200 hover:bg-purple-600"
              >
                Add Image{" "}
              </button>
              {formImages.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-2"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(file.name, setFormImages)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={submitLoading}
            className={`bg-purple-500 text-white rounded px-4 py-2 transition duration-200 hover:bg-purple-600 ${
              submitLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      ) : (
        <p className="text-gray-500">
          No details available for this AWB number.
        </p>
      )}
    </div>
  );
};

export default PickupDetails;