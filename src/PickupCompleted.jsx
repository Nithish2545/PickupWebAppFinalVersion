import React from "react";

const PickupCompleted = ({ userData, pickupPersons }) => {
  return (
    <div>
      {userData.length === 0 ? (
        <div className="flex items-center justify-center p-4">
          <p className="text-gray-500 text-lg">No pickups available</p>
        </div>
      ) : (
        userData.map((user, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 mb-4 shadow-md cursor-pointer"
            onClick={() => handleCardPress(user.AWB_NUMBER)}
          >
            <div className="mb-3 ">
              <div
                className={`py-1 flex justify-between items-center px-3 rounded-full ${
                  user.STATUS === "PENDING"
                    ? "bg-red-100"
                    : user.STATUS === "COMPLETED"
                    ? "bg-green-100"
                    : "bg-gray-200"
                }`}
              >
                <p
                  className={`font-bold text-sm ${
                    user.STATUS === "PENDING"
                      ? "text-red-600"
                      : user.STATUS === "COMPLETED"
                      ? "text-green-600"
                      : "text-gray-700"
                  }`}
                >
                  PICKUP COMPLETED
                </p>
                <p className="text-green-700 font-semibold text-lg">
                  {user.pickuparea}
                </p>
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">AWB No:</span>
              <span className="text-gray-800">{user.awbNumber || "N/A"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">Consignee:</span>
              <span className="text-gray-800">
                {user.consignorname || "N/A"}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">Destination:</span>
              <span className="text-gray-800">{user.destination || "N/A"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">
                Post Pickup Weight:
              </span>
              <span className="text-gray-800">
                {user.postPickupWeight || "N/A"}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">
                Pickup Completed:
              </span>
              <span className="text-gray-800">
                {user.pickupCompletedDatatime || "N/A"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PickupCompleted;
