import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MdKeyboardBackspace } from "react-icons/md";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

import bg from "../assets/authBg.png";

function Customize2() {
  const {
    userData,
    backendImage,
    selectedImage,
    serverUrl,
    setUserData,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );

  const [loading, setLoading] = useState(false);

  // =====================================================
  // PREVIEW IMAGE
  // =====================================================

  const previewImage = useMemo(() => {
    if (backendImage) {
      return URL.createObjectURL(backendImage);
    }

    if (selectedImage) {
      return selectedImage;
    }

    return userData?.assistantImage || "";
  }, [
    backendImage,
    selectedImage,
    userData?.assistantImage,
  ]);

  // =====================================================
  // CLEANUP GENERATED OBJECT URL
  // =====================================================

  useEffect(() => {
    return () => {
      if (
        backendImage &&
        previewImage?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [backendImage, previewImage]);

  // =====================================================
  // UPDATE ASSISTANT
  // =====================================================

  const handleUpdateAssistant = async () => {
    const cleanName = assistantName.trim();

    if (!cleanName) {
      alert("Please enter an assistant name.");
      return;
    }

    if (
      !backendImage &&
      !selectedImage &&
      !userData?.assistantImage
    ) {
      alert("Please select an assistant image.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // =================================================
      // ASSISTANT NAME
      // =================================================

      formData.append(
        "assistantName",
        cleanName
      );

      // =================================================
      // IMAGE
      // =================================================

      if (backendImage) {
        formData.append(
          "assistantImage",
          backendImage
        );
      }

      // Predefined image URL
      if (selectedImage) {
        formData.append(
          "imageUrl",
          selectedImage
        );
      }

      console.log(
        "===================================="
      );

      console.log(
        "UPDATING ASSISTANT"
      );

      console.log(
        "NAME:",
        cleanName
      );

      console.log(
        "SELECTED IMAGE:",
        selectedImage
      );

      console.log(
        "BACKEND IMAGE:",
        backendImage
      );

      console.log(
        "===================================="
      );

      // =================================================
      // BACKEND REQUEST
      // =================================================

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(
        "UPDATE ASSISTANT RESPONSE:",
        result.data
      );

      // =================================================
      // SUCCESS
      // =================================================

      if (
        result.data?.success &&
        result.data?.user
      ) {
        const updatedUser =
          result.data.user;

        console.log(
          "UPDATED USER:",
          updatedUser
        );

        // Update React context
        setUserData(updatedUser);

        // =================================================
        // VERIFY ASSISTANT DATA
        // =================================================

        if (
          updatedUser.assistantName &&
          updatedUser.assistantImage
        ) {
          console.log(
            "ASSISTANT CONFIGURED SUCCESSFULLY"
          );

          // IMPORTANT:
          // Go directly to HOME
          navigate("/home", {
            replace: true,
          });

          return;
        }

        console.error(
          "Assistant image/name missing after update:",
          updatedUser
        );

        alert(
          "Assistant was not saved completely. Please try again."
        );

        return;
      }

      // =================================================
      // INVALID RESPONSE
      // =================================================

      console.error(
        "Invalid update response:",
        result.data
      );

      alert(
        "Assistant update failed. Please try again."
      );
    } catch (error) {
      console.error(
        "===================================="
      );

      console.error(
        "ASSISTANT UPDATE ERROR"
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "DATA:",
        error?.response?.data
      );

      console.error(
        "MESSAGE:",
        error?.message
      );

      console.error(
        "===================================="
      );

      alert(
        error?.response?.data?.message ||
          "Unable to create assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          scale-110
          opacity-45
        "
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />

      {/* =================================================
          COLOR ATMOSPHERE
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-[#020617]/80
          via-[#061a35]/65
          to-[#18052f]/85
        "
      />

      {/* CYAN LIGHT */}

      <div
        className="
          absolute
          -top-52
          -left-52
          w-[650px]
          h-[650px]
          rounded-full
          bg-cyan-400/20
          blur-[160px]
          animate-pulse
        "
      />

      {/* BLUE LIGHT */}

      <div
        className="
          absolute
          top-1/4
          -right-64
          w-[700px]
          h-[700px]
          rounded-full
          bg-blue-600/20
          blur-[170px]
        "
      />

      {/* PURPLE LIGHT */}

      <div
        className="
          absolute
          -bottom-64
          left-1/3
          w-[650px]
          h-[650px]
          rounded-full
          bg-purple-600/20
          blur-[170px]
        "
      />

      {/* =================================================
          PARTICLES
      ================================================= */}

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 35 }).map(
          (_, index) => (
            <span
              key={index}
              className="
                absolute
                w-[2px]
                h-[2px]
                rounded-full
                bg-cyan-200/50
                animate-particle
              "
              style={{
                left: `${(index * 23) % 100}%`,
                top: `${(index * 37) % 100}%`,
                animationDelay: `${index * 0.25}s`,
                animationDuration: `${
                  5 + (index % 6)
                }s`,
              }}
            />
          )
        )}
      </div>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={() => navigate("/customize")}
        className="
          absolute
          top-7
          left-7
          z-50
          w-12
          h-12
          rounded-2xl
          border
          border-white/10
          bg-white/[0.06]
          backdrop-blur-2xl
          text-white/80
          flex
          items-center
          justify-center
          hover:bg-cyan-400/10
          hover:border-cyan-300/30
          hover:text-cyan-200
          hover:scale-105
          active:scale-95
          transition-all
          duration-300
        "
      >
        <MdKeyboardBackspace className="w-6 h-6" />
      </button>

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          relative
          z-20
          w-[94%]
          max-w-5xl
          min-h-[650px]
          rounded-[40px]
          border
          border-white/10
          bg-white/[0.045]
          backdrop-blur-[35px]
          shadow-[0_40px_150px_rgba(0,0,0,0.65)]
          overflow-hidden
          flex
          flex-col
          items-center
          justify-center
          px-6
          py-12
          md:px-14
        "
      >

        {/* TOP GLOW */}

        <div
          className="
            absolute
            top-0
            left-1/2
            -translate-x-1/2
            w-[55%]
            h-[2px]
            bg-gradient-to-r
            from-transparent
            via-cyan-300/70
            to-transparent
            blur-[1px]
          "
        />

        {/* =================================================
            3D ASSISTANT CORE
        ================================================= */}

        <div
          className="
            relative
            w-[280px]
            h-[280px]
            md:w-[350px]
            md:h-[350px]
            flex
            items-center
            justify-center
          "
        >

          {/* OUTER GLOW */}

          <div
            className="
              absolute
              inset-[12%]
              rounded-full
              bg-cyan-400/20
              blur-[70px]
              animate-pulse
            "
          />

          {/* BIG OUTER RING */}

          <div
            className="
              absolute
              inset-0
              rounded-full
              border
              border-cyan-300/10
              shadow-[inset_0_0_80px_rgba(34,211,238,0.08)]
            "
          />

          {/* ROTATING RING */}

          <div
            className="
              absolute
              inset-[5%]
              rounded-full
              border
              border-cyan-300/20
              border-t-cyan-200
              border-r-transparent
              animate-spin-slow
            "
          />

          {/* SECOND RING */}

          <div
            className="
              absolute
              inset-[12%]
              rounded-full
              border
              border-blue-300/20
              border-b-blue-300
              border-l-transparent
              animate-spin-reverse
            "
          />

          {/* THIRD RING */}

          <div
            className="
              absolute
              inset-[19%]
              rounded-full
              border
              border-purple-300/20
              border-l-purple-300/70
              animate-spin-slow
            "
          />

          {/* ORBIT DOT */}

          <div
            className="
              absolute
              inset-[5%]
              rounded-full
              animate-spin-slow
            "
          >
            <span
              className="
                absolute
                top-0
                left-1/2
                -translate-x-1/2
                w-3
                h-3
                rounded-full
                bg-cyan-200
                shadow-[0_0_25px_rgba(103,232,249,1)]
              "
            />
          </div>

          {/* SECOND ORBIT DOT */}

          <div
            className="
              absolute
              inset-[12%]
              rounded-full
              animate-spin-reverse
            "
          >
            <span
              className="
                absolute
                bottom-0
                left-1/2
                -translate-x-1/2
                w-2
                h-2
                rounded-full
                bg-purple-200
                shadow-[0_0_20px_rgba(216,180,254,1)]
              "
            />
          </div>

          {/* CORE */}

          <div
            className="
              relative
              z-20
              w-[190px]
              h-[190px]
              md:w-[235px]
              md:h-[235px]
              rounded-full
              p-[3px]
              bg-gradient-to-br
              from-cyan-200
              via-blue-500
              to-purple-600
              shadow-[0_0_90px_rgba(34,211,238,0.30)]
              animate-float
            "
          >

            <div
              className="
                relative
                w-full
                h-full
                rounded-full
                overflow-hidden
                bg-[#020617]
                border
                border-white/20
              "
            >

              {previewImage ? (
                <img
                  src={previewImage}
                  alt="AI"
                  className="
                    w-full
                    h-full
                    object-cover
                    object-center
                    select-none
                    scale-105
                  "
                  draggable="false"
                />
              ) : (
                <div
                  className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    bg-gradient-to-br
                    from-cyan-950
                    via-blue-950
                    to-purple-950
                  "
                >
                  <span
                    className="
                      text-6xl
                      font-black
                      text-cyan-200
                      drop-shadow-[0_0_25px_rgba(34,211,238,0.8)]
                    "
                  >
                    AI
                  </span>
                </div>
              )}

              {/* GLASS SHINE */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-tr
                  from-transparent
                  via-white/[0.15]
                  to-transparent
                  pointer-events-none
                "
              />

            </div>
          </div>

        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="relative z-20 text-center mt-3">

          <h1
            className="
              text-4xl
              md:text-6xl
              font-black
              tracking-tight
              bg-gradient-to-r
              from-white
              via-cyan-100
              to-blue-300
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_30px_rgba(34,211,238,0.18)]
            "
          >
            Name Your AI
          </h1>

        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <div
          className="
            relative
            z-20
            w-full
            max-w-xl
            mt-8
          "
        >

          <div
            className="
              relative
              rounded-2xl
              p-[1px]
              bg-gradient-to-r
              from-cyan-400/30
              via-blue-500/30
              to-purple-500/30
            "
          >

            <input
              type="text"
              placeholder="Enter assistant name..."
              value={assistantName}
              onChange={(e) =>
                setAssistantName(e.target.value)
              }
              disabled={loading}
              maxLength={30}
              className="
                w-full
                h-16
                rounded-2xl
                outline-none
                border-none
                bg-[#020617]/80
                backdrop-blur-xl
                px-6
                text-lg
                text-white
                placeholder-white/25
                focus:ring-2
                focus:ring-cyan-300/20
                transition-all
              "
            />

          </div>

          <div
            className="
              mt-2
              text-right
              text-[10px]
              text-white/25
            "
          >
            {assistantName.length}/30
          </div>

        </div>

        {/* =================================================
            CREATE BUTTON
        ================================================= */}

        {assistantName.trim() && (
          <button
            type="button"
            disabled={loading}
            onClick={handleUpdateAssistant}
            className="
              relative
              z-20
              mt-5
              w-full
              max-w-xl
              h-14
              rounded-2xl
              overflow-hidden
              bg-gradient-to-r
              from-cyan-500
              via-blue-600
              to-purple-600
              text-white
              font-bold
              shadow-[0_15px_50px_rgba(37,99,235,0.35)]
              hover:-translate-y-1
              hover:shadow-[0_20px_60px_rgba(34,211,238,0.35)]
              active:scale-[0.98]
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition-all
              duration-300
            "
          >

            {!loading && (
              <span
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/25
                  to-transparent
                  -translate-x-full
                  hover:translate-x-full
                  transition-transform
                  duration-700
                "
              />
            )}

            <span className="relative">
              {loading
                ? "Creating..."
                : "Create Assistant ✦"}
            </span>

          </button>
        )}

      </main>

      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style>{`

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spinSlow 12s linear infinite;
        }

        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        .animate-spin-reverse {
          animation: spinReverse 18s linear infinite;
        }

        @keyframes particle {

          0% {
            transform:
              translateY(30px)
              scale(0.4);

            opacity: 0;
          }

          20% {
            opacity: 0.6;
          }

          80% {
            opacity: 0.25;
          }

          100% {
            transform:
              translateY(-150px)
              scale(1);

            opacity: 0;
          }
        }

        .animate-particle {
          animation:
            particle
            7s
            ease-in-out
            infinite;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color:
            rgba(103,232,249,0.25)
            transparent;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background:
            rgba(103,232,249,0.25);

          border-radius: 999px;
        }

      `}</style>

    </div>
  );
}

export default Customize2;
