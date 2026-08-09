
import React, { useRef, useContext } from "react";
import { MdKeyboardBackspace } from "react-icons/md";
import Card from "../components/Card";

import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";

import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

function Customize() {
  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
      setSelectedImage(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030712] flex flex-col items-center justify-center px-5 py-12">

      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-[#071a3a] to-purple-950 opacity-90" />

        {/* Cyan glow */}
        <div
          className="
            absolute
            -top-40
            -left-40
            w-[600px]
            h-[600px]
            rounded-full
            bg-cyan-500/20
            blur-[140px]
            animate-glow
          "
        />

        {/* Blue glow */}
        <div
          className="
            absolute
            top-[35%]
            -right-48
            w-[650px]
            h-[650px]
            rounded-full
            bg-blue-600/20
            blur-[150px]
            animate-glow-delay
          "
        />

        {/* Purple glow */}
        <div
          className="
            absolute
            -bottom-60
            left-[25%]
            w-[600px]
            h-[600px]
            rounded-full
            bg-purple-600/20
            blur-[150px]
            animate-glow-slow
          "
        />

        {/* Grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.07]
            background-grid
          "
        />

        {/* Floating particles */}
        {Array.from({ length: 35 }).map((_, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-cyan-200/50 animate-floating-particle"
            style={{
              width: `${2 + (index % 3)}px`,
              height: `${2 + (index % 3)}px`,
              left: `${(index * 17) % 100}%`,
              top: `${(index * 29) % 100}%`,
              animationDelay: `${index * 0.25}s`,
              animationDuration: `${5 + (index % 6)}s`,
            }}
          />
        ))}
      </div>

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => navigate("/")}
        className="
          absolute
          top-7
          left-7
          z-50
          w-12
          h-12
          rounded-2xl
          flex
          items-center
          justify-center
          text-white
          border
          border-white/15
          bg-white/[0.08]
          backdrop-blur-xl
          shadow-[0_10px_40px_rgba(0,0,0,0.35)]
          hover:bg-cyan-400/15
          hover:border-cyan-300/40
          hover:text-cyan-200
          hover:scale-110
          hover:-rotate-3
          transition-all
          duration-300
        "
      >
        <MdKeyboardBackspace className="w-6 h-6" />
      </button>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative z-20 w-full max-w-6xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="text-center mb-10">

          {/* Badge */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-5
              py-2
              rounded-full
              border
              border-cyan-300/20
              bg-cyan-300/[0.06]
              backdrop-blur-xl
              shadow-[0_0_30px_rgba(34,211,238,0.08)]
              mb-5
            "
          >
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse" />

            <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-100/70 font-bold">
              AI CONFIGURATION
            </span>
          </div>

          {/* Heading */}
          <h1
            className="
              text-4xl
              sm:text-5xl
              md:text-6xl
              font-black
              tracking-tight
              bg-gradient-to-r
              from-white
              via-cyan-200
              to-purple-300
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_30px_rgba(34,211,238,0.15)]
            "
          >
            Select Your AI
          </h1>

          <p className="mt-4 text-sm md:text-base text-white/45 max-w-xl mx-auto leading-relaxed">
            Choose the visual identity of your personal AI assistant.
          </p>

        </div>

        {/* ===================================================
            3D IMAGE SELECTION AREA
        =================================================== */}

        <section
          className="
            relative
            rounded-[36px]
            border
            border-white/10
            bg-white/[0.055]
            backdrop-blur-3xl
            shadow-[0_35px_120px_rgba(0,0,0,0.5)]
            px-5
            py-8
            sm:px-8
            sm:py-10
            md:px-12
            md:py-12
          "
        >

          {/* Top glowing line */}
          <div
            className="
              absolute
              top-0
              left-1/2
              -translate-x-1/2
              w-[65%]
              h-px
              bg-gradient-to-r
              from-transparent
              via-cyan-300/70
              to-transparent
            "
          />

          {/* Inner glow */}
          <div
            className="
              absolute
              inset-0
              rounded-[36px]
              pointer-events-none
              bg-gradient-to-br
              from-cyan-400/[0.035]
              via-transparent
              to-purple-500/[0.04]
            "
          />

          {/* Section title */}
          <div className="relative z-10 text-center mb-8">

            <h2 className="text-xl md:text-2xl font-bold text-white">
              Choose an avatar
            </h2>

            <p className="mt-2 text-xs text-white/35">
              Select an existing avatar or upload your own image.
            </p>

          </div>

          {/* =================================================
              CARDS
          ================================================= */}

          <div
            className="
              relative
              z-10
              w-full
              flex
              justify-center
              items-center
              flex-wrap
              gap-5
              sm:gap-6
              md:gap-7
              [perspective:1200px]
            "
          >

            {/* Existing cards */}
            <div className="premium-card">
              <Card image={image1} />
            </div>

            <div className="premium-card">
              <Card image={image2} />
            </div>

            <div className="premium-card">
              <Card image={image3} />
            </div>

            <div className="premium-card">
              <Card image={image4} />
            </div>

            <div className="premium-card">
              <Card image={image5} />
            </div>

            <div className="premium-card">
              <Card image={image6} />
            </div>

            <div className="premium-card">
              <Card image={image7} />
            </div>

            {/* =================================================
                UPLOAD CARD
            ================================================= */}

            <div
              onClick={() => inputImage.current.click()}
              className="
                group
                relative
                w-[70px]
                h-[140px]
                lg:w-[150px]
                lg:h-[250px]
                rounded-2xl
                overflow-hidden
                cursor-pointer
                border-2
                border-dashed
                border-cyan-300/30
                bg-gradient-to-br
                from-cyan-400/[0.08]
                via-blue-500/[0.05]
                to-purple-500/[0.08]
                backdrop-blur-xl
                shadow-[0_15px_45px_rgba(0,0,0,0.3)]
                hover:border-cyan-200/70
                hover:shadow-[0_0_45px_rgba(34,211,238,0.25)]
                hover:-translate-y-3
                hover:rotate-y-3
                transition-all
                duration-500
                flex
                items-center
                justify-center
              "
            >

              {/* Shine */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-white/10
                  via-transparent
                  to-transparent
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-500
                "
              />

              {frontendImage ? (
                <img
                  src={frontendImage}
                  alt="Selected"
                  className="
                    relative
                    z-10
                    w-full
                    h-full
                    object-cover
                    group-hover:scale-110
                    transition-transform
                    duration-700
                  "
                />
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-3">

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      bg-cyan-400/10
                      border
                      border-cyan-300/20
                      shadow-[0_0_30px_rgba(34,211,238,0.15)]
                      group-hover:scale-110
                      group-hover:rotate-6
                      transition-all
                      duration-300
                    "
                  >
                    <RiImageAddLine className="text-cyan-200 text-3xl" />
                  </div>

                  <span className="hidden lg:block text-[10px] uppercase tracking-widest text-cyan-100/45 font-semibold">
                    Upload
                  </span>

                </div>
              )}

            </div>

            <input
              type="file"
              accept="image/*"
              ref={inputImage}
              hidden
              onChange={handleImage}
            />

          </div>

          {/* =================================================
              SELECTED STATUS
          ================================================= */}

          <div className="relative z-10 flex justify-center mt-9">

            {selectedImage || frontendImage ? (
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-full
                  border
                  border-emerald-300/20
                  bg-emerald-400/[0.07]
                  backdrop-blur-xl
                  text-emerald-200/80
                  text-xs
                "
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />

                Image selected
              </div>
            ) : (
              <div
                className="
                  text-xs
                  text-white/25
                "
              >
                Select an image to continue
              </div>
            )}

          </div>

          {/* =================================================
              NEXT BUTTON
          ================================================= */}

          {selectedImage && (
            <div className="relative z-10 flex justify-center mt-8">

              <button
                type="button"
                onClick={() => navigate("/customize2")}
                className="
                  group
                  relative
                  overflow-hidden
                  w-52
                  h-14
                  rounded-2xl
                  font-bold
                  text-white
                  bg-gradient-to-r
                  from-cyan-500
                  via-blue-600
                  to-purple-600
                  shadow-[0_15px_50px_rgba(37,99,235,0.35)]
                  hover:-translate-y-1
                  hover:scale-[1.02]
                  hover:shadow-[0_20px_65px_rgba(34,211,238,0.35)]
                  active:scale-[0.98]
                  transition-all
                  duration-300
                "
              >

                {/* Button shine */}
                <span
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-transparent
                    via-white/25
                    to-transparent
                    -translate-x-full
                    group-hover:translate-x-full
                    transition-transform
                    duration-700
                  "
                />

                <span className="relative flex items-center justify-center gap-3">
                  Continue
                  <span className="text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>

              </button>

            </div>
          )}

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="mt-7 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/20">
            Personal AI • Choose Your Identity
          </p>
        </div>

      </main>

      {/* =====================================================
          CUSTOM ANIMATIONS
      ===================================================== */}

      <style>{`
        @keyframes glow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.55;
          }

          50% {
            transform: translate3d(30px, -25px, 0) scale(1.08);
            opacity: 0.85;
          }
        }

        @keyframes glowDelay {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.45;
          }

          50% {
            transform: translate3d(-35px, 25px, 0) scale(1.1);
            opacity: 0.75;
          }
        }

        @keyframes glowSlow {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.12);
          }
        }

        @keyframes floatingParticle {
          0% {
            transform: translate3d(0, 40px, 0) scale(0.5);
            opacity: 0;
          }

          20% {
            opacity: 0.6;
          }

          70% {
            opacity: 0.35;
          }

          100% {
            transform: translate3d(20px, -160px, 0) scale(1.2);
            opacity: 0;
          }
        }

        .animate-glow {
          animation: glow 8s ease-in-out infinite;
        }

        .animate-glow-delay {
          animation: glowDelay 10s ease-in-out infinite;
        }

        .animate-glow-slow {
          animation: glowSlow 12s ease-in-out infinite;
        }

        .animate-floating-particle {
          animation: floatingParticle 7s ease-in-out infinite;
        }

        .background-grid {
          background-image:
            linear-gradient(rgba(103,232,249,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(103,232,249,0.15) 1px, transparent 1px);
          background-size: 55px 55px;
          mask-image: linear-gradient(to bottom, black, transparent);
        }

        .premium-card {
          position: relative;
          transform-style: preserve-3d;
          transition:
            transform 0.45s ease,
            filter 0.45s ease;
          filter: drop-shadow(0 15px 25px rgba(0,0,0,0.25));
        }

        .premium-card:hover {
          transform:
            translateY(-14px)
            rotateX(5deg)
            rotateY(-5deg)
            scale(1.04);
          filter:
            drop-shadow(0 25px 35px rgba(34,211,238,0.22));
        }

        @media (max-width: 640px) {
          .premium-card:hover {
            transform: translateY(-8px) scale(1.02);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(34,211,238,0.3) transparent;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(34,211,238,0.25);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}

export default Customize;

