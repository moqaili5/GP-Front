import React, { useRef, useState, useEffect } from "react";

const LeaderBoard = ({ data, canEdit, onEdit, onDelete }) => {
  // Prepare students array in [2nd, 1st, 3rd] order for the podium
  const students = [
    data.top2 || {},
    data.top1 || {},
    data.top3 || {},
  ];
  // Heights for podium bars (middle is tallest)
  const heights = ["h-24 sm:h-32", "h-36 sm:h-48", "h-20 sm:h-28"];
  const numbers = [2, 1, 3];

  // Three dots menu state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 w-full max-w-2xl mx-auto">
      {/* Title and three dots menu */}
      <div className="flex justify-between items-center mb-2" dir="rtl">
        <div className="font-bold text-lg text-blue-800">{data.name}</div>
        {canEdit && (
          <div className="relative" ref={menuRef}>
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setShowMenu((prev) => !prev)}
              type="button"
              aria-label="خيارات"
            >
              {/* Three dots icon */}
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="4" cy="10" r="2" />
                <circle cx="10" cy="10" r="2" />
                <circle cx="16" cy="10" r="2" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute left-0 mt-2 w-32 bg-gray-900 text-white border rounded-xl shadow-lg z-20 py-2">
                <button
                  className="block w-full text-right px-4 py-2 text-base hover:bg-gray-800"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  type="button"
                >
                  تعديل
                </button>
                <button
                  className="block w-full text-right px-4 py-2 text-base hover:bg-gray-800"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  type="button"
                >
                  حذف
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-gray-700 mb-2 " dir="rtl">{data.description}</div>
      <div className="mb-2 text-blue-700 font-semibold" dir="rtl">
        المناسبة: {data.eventTitle}
      </div>
      {/* Podium */}
      <div className="flex justify-center items-end gap-2 sm:gap-6 mt-8 mb-4 w-full">
        {students.map((student, idx) => (
          <div key={idx} className="flex flex-col items-center w-1/3">
            {/* Avatar */}
            <div className={`flex flex-col items-center mb-2`}>
              <div className={`rounded-full border-4 ${idx === 1 ? "border-yellow-400" : "border-blue-200"} shadow-lg bg-white`}>
                {student?.profilePicture ? (
                  <img
                    src={student.profilePicture}
                    alt={student.name || student.email || "طالب"}
                    className={`object-cover w-16 h-16 sm:w-20 sm:h-20 rounded-full`}
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400">
                    👤
                  </div>
                )}
              </div>
              <div className="font-bold text-gray-800 text-xs sm:text-sm mt-2 text-center">
                {student?.name || student?.email || "طالب"}
              </div>
              {student?.points && (
                <div className="text-[11px] text-gray-500 text-center">
                  {student.points} نقطة
                </div>
              )}
            </div>
            {/* Podium Bar */}
            <div
              className={`flex items-end justify-center bg-green-100 rounded-t-lg ${heights[idx]} w-16 sm:w-20 shadow-md`}
              style={{
                minHeight: "3rem",
                maxHeight: "12rem",
              }}
            >
              <span className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">{numbers[idx]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderBoard;