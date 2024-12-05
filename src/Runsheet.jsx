import { useNavigate } from "react-router-dom";

const PickupCompleted = ({ userData, pickupPersons }) => {
  const navigate = useNavigate();
  const handleCardPress = (awbNumber) => {
    // Handle card press action
    navigate(`/pickupdetails/${awbNumber}`);
  };

  const handleOpenMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank").focus(); // Opens URL in a new tab
  };

  return (
    <div>
      {userData.length === 0 ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500 text-lg">No pickups available</p>
        </div>
      ) : (
        userData.map((user, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 mb-6 shadow-md"
            onClick={() => handleCardPress(user.awbNumber)}
          >
            <div className="mb-4 ">
              <div
                className={`py-2 flex items-center justify-between px-4 rounded-full ${
                  user.STATUS === "PENDING"
                    ? "bg-red-200"
                    : user.STATUS === "COMPLETED"
                    ? "bg-green-200"
                    : "bg-gray-200"
                }`}
              >
                <p
                  className={`font-bold text-sm ${
                    user.STATUS === "PENDING"
                      ? "text-red-700"
                      : user.STATUS === "COMPLETED"
                      ? "text-green-700"
                      : "text-gray-700"
                  }`}
                >
                  RUN SHEET
                </p>
                <p className="text-green-600 font-semibold text-lg">
                  {user.pickuparea}
                </p>
              </div>
            </div>

            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">AWB Number:</span>
              <span className="text-gray-700">{user.awbNumber || "N/A"}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">Consignor:</span>
              <span className="text-gray-700">
                {user.consignorname || "N/A"}
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">Phonenumber: </span>
              <span className="text-gray-700 ">
                {user.consignorphonenumber || "N/A"}
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">Country:</span>
              <span className="text-gray-700">{user.destination || "N/A"}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">Weight APX:</span>
              <span className="text-gray-700">{user.weightapx || "N/A"}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">
                Pickup DateTime:
              </span>
              <span className="text-gray-700">
                {user.pickupDatetime || "N/A"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">
                Pickup Address:
              </span>
              <span className="text-gray-700 w-[60%]">
                {user.consignorlocation || "N/A"}
              </span>
            </div>

            <div className="flex w-full justify-between">
              {/* <div className="p-3 pl-5 pr-5  bg-[#6D28D9] text-white rounded-full">
                <p>Call</p>
              </div> */}
              <div
                onClick={() => handleOpenMap(user.latitude, user.longitude)}
                className="p-3 pl-5 pr-5  bg-[#6D28D9] text-white rounded-full"
              >
                View Map
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PickupCompleted;
