import React from "react";

const ClubPage = ({
  club,
  joinStatus,
  loadingJoin,
  onJoin,
  onLeave,
  showJoinButton,
}) => {
  let buttonLabel = "طلب انضمام";
  let buttonDisabled = false;
  let buttonAction = onJoin;
  let buttonColorClass = "bg-blue-600 text-white hover:bg-blue-700";

  if (joinStatus === "pending") {
    buttonLabel = "بانتظار الموافقة";
    buttonDisabled = true;
    buttonAction = null;
    buttonColorClass = "bg-gray-400 text-white";
  } else if (joinStatus === "approved") {
    buttonLabel = "إلغاء الانضمام";
    buttonDisabled = false;
    buttonAction = onLeave;
    buttonColorClass = "bg-red-600 text-white hover:bg-red-700";
  } else if (joinStatus === "rejected") {
    buttonLabel = "مرفوض";
    buttonDisabled = true;
    buttonAction = null;
    buttonColorClass = "bg-gray-400 text-white";
  }

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden w-[91%] mx-auto">
      {/* Cover Photo */}
      <div className="relative">
        <img
          src={club?.coverPicture || "https://www.ppu.edu/p/sites/default/files/ppu-1714156162-118aabb4-40c7-4373-8f3a-127f4e52a705.jpeg"}
          alt="Cover Photo"
          className="w-full h-48 object-cover"
        />
        {/* Personal Photo */}
        <div className="absolute bottom-0 right-8 translate-y-1/2">
          <img
            src={club?.profilePicture || "https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg"}
            alt="Personal Photo"
            className="w-32 h-32 rounded-lg border-4 border-white object-cover shadow-lg"
          />
        </div>
      </div>

      {/* Club Name and Join/Leave Button */}
      <div className="flex flex-row-reverse items-center justify-between px-8 pt-2 pb-8 ">
        <h3 className="text-3xl font-bold text-gray-800 px-[150px]">
          {club?.name || "نادي كلية الطب البشري"}
        </h3>
        <div className="flex gap-4">
          {showJoinButton && (
            <button
              className={`px-8 py-2 rounded-full text-lg font-semibold transition duration-200 flex items-center gap-2 ${buttonColorClass} ${buttonDisabled || loadingJoin ? "cursor-not-allowed" : ""}`}
              onClick={buttonAction}
              disabled={buttonDisabled || loadingJoin}
            >
              <span>
                {loadingJoin ? "جاري الإرسال..." : buttonLabel}
              </span>
              {joinStatus === "approved" ? (
                // Leave icon
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
              ) : (
                // Join icon
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-8 pb-8">
        <p className="text-xl text-gray-800  leading-relaxed " dir="rtl">
          {club?.description ||
            "نادي كلية الطب البشري بالجامعة هذا نص تجريبي. نادي كلية الطب البشري بالجامعة هذا نص تجريبي. نادي كلية الطب البشري بالجامعة هذا نص تجريبي. نادي كلية الطب البشري بالجامعة هذا نص تجريبي."}
        </p>
      </div>
    </div>
  );
};

export default ClubPage;