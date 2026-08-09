
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoEye, IoEyeOff } from "react-icons/io5";
import bg from "../assets/authBg.png";
import { userDataContext } from "../context/UserContext";

function SignIn() {
  const navigate = useNavigate();

  const { serverUrl, setUserData } =
    useContext(userDataContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);
  const [err, setErr] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

    setErr("");
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);

      setUserData(result.data);

      navigate("/");
    } catch (error) {
      console.error(error);

      setUserData(null);

      setErr(
        error?.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-8">

      {/* BACKGROUND */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          scale-105
        "
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />

      {/* DARK COLOR LAYER */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-[#020617]/90
          via-[#071b3a]/75
          to-[#16052d]/90
        "
      />

      {/* CYAN GLOW */}
      <div
        className="
          absolute
          -top-44
          -left-44
          w-[520px]
          h-[520px]
          rounded-full
          bg-cyan-400/20
          blur-[130px]
          animate-pulse
        "
      />

      {/* BLUE GLOW */}
      <div
        className="
          absolute
          -bottom-52
          -right-44
          w-[620px]
          h-[620px]
          rounded-full
          bg-blue-600/20
          blur-[145px]
          animate-pulse
        "
      />

      {/* PURPLE GLOW */}
      <div
        className="
          absolute
          top-[30%]
          right-[30%]
          w-[300px]
          h-[300px]
          rounded-full
          bg-purple-500/15
          blur-[120px]
        "
      />

      {/* FLOATING LIGHTS */}
      <div
        className="
          absolute
          inset-0
          pointer-events-none
        "
      >

        <span
          className="
            absolute
            top-[18%]
            left-[12%]
            w-3
            h-3
            rounded-full
            bg-cyan-300
            shadow-[0_0_25px_rgba(34,211,238,1)]
            animate-orb-one
          "
        />

        <span
          className="
            absolute
            top-[22%]
            right-[13%]
            w-2
            h-2
            rounded-full
            bg-blue-300
            shadow-[0_0_20px_rgba(96,165,250,1)]
            animate-orb-two
          "
        />

        <span
          className="
            absolute
            bottom-[18%]
            left-[16%]
            w-2
            h-2
            rounded-full
            bg-purple-300
            shadow-[0_0_20px_rgba(192,132,252,1)]
            animate-orb-three
          "
        />

        <span
          className="
            absolute
            bottom-[22%]
            right-[18%]
            w-3
            h-3
            rounded-full
            bg-cyan-200
            shadow-[0_0_25px_rgba(103,232,249,1)]
            animate-orb-two
          "
        />

      </div>

      {/* MAIN CARD */}
      <main
        className="
          relative
          z-20
          w-full
          max-w-[500px]
          animate-card-float
        "
      >

        <div
          className="
            relative
            rounded-[32px]
            border
            border-white/15
            bg-white/[0.08]
            backdrop-blur-2xl
            shadow-[0_30px_110px_rgba(0,0,0,0.60)]
            px-6
            py-10
            sm:px-10
            sm:py-12
            overflow-hidden
          "
        >

          {/* TOP BORDER GLOW */}
          <div
            className="
              absolute
              top-0
              left-1/2
              -translate-x-1/2
              w-[70%]
              h-[2px]
              bg-gradient-to-r
              from-transparent
              via-cyan-300
              to-transparent
            "
          />

          {/* INNER LIGHT */}
          <div
            className="
              absolute
              inset-0
              pointer-events-none
              bg-gradient-to-b
              from-cyan-300/[0.04]
              via-transparent
              to-purple-500/[0.04]
            "
          />

          {/* AI LOGO */}
          <div className="relative flex justify-center mb-7">

            <div
              className="
                relative
                w-20
                h-20
                rounded-3xl
                p-[2px]
                bg-gradient-to-br
                from-cyan-300
                via-blue-600
                to-purple-600
                shadow-[0_0_50px_rgba(34,211,238,0.30)]
                rotate-3
                hover:rotate-0
                hover:scale-105
                transition-all
                duration-500
              "
            >

              <div
                className="
                  w-full
                  h-full
                  rounded-[22px]
                  bg-[#061329]
                  flex
                  items-center
                  justify-center
                "
              >
                <span
                  className="
                    text-2xl
                    font-black
                    bg-gradient-to-r
                    from-cyan-300
                    to-blue-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  AI
                </span>
              </div>

            </div>

          </div>

          {/* TITLE */}
          <div className="relative text-center mb-9">

            <h1
              className="
                text-3xl
                sm:text-4xl
                font-black
                tracking-tight
                bg-gradient-to-r
                from-white
                via-cyan-100
                to-blue-300
                bg-clip-text
                text-transparent
              "
            >
              Welcome Back
            </h1>

            <div
              className="
                mx-auto
                mt-3
                w-20
                h-[2px]
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                via-blue-500
                to-purple-500
              "
            />

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSignIn}
            className="relative space-y-5"
          >

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email"
              className="
                w-full
                h-[58px]
                rounded-2xl
                border
                border-white/15
                bg-black/20
                backdrop-blur-xl
                outline-none
                text-white
                placeholder-white/30
                px-5
                text-base
                transition-all
                duration-300
                focus:border-cyan-300/60
                focus:ring-4
                focus:ring-cyan-400/10
              "
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            {/* PASSWORD */}
            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                className="
                  w-full
                  h-[58px]
                  rounded-2xl
                  border
                  border-white/15
                  bg-black/20
                  backdrop-blur-xl
                  outline-none
                  text-white
                  placeholder-white/30
                  px-5
                  pr-14
                  text-base
                  transition-all
                  duration-300
                  focus:border-blue-300/60
                  focus:ring-4
                  focus:ring-blue-400/10
                "
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="
                  absolute
                  right-5
                  top-1/2
                  -translate-y-1/2
                  text-white/60
                  hover:text-cyan-300
                  transition-colors
                "
              >
                {showPassword ? (
                  <IoEyeOff className="text-xl" />
                ) : (
                  <IoEye className="text-xl" />
                )}
              </button>

            </div>

            {/* ERROR */}
            {err && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-400/20
                  bg-red-500/10
                  px-4
                  py-3
                  text-center
                  text-sm
                  text-red-300
                "
              >
                {err}
              </div>
            )}

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`
                relative
                overflow-hidden
                w-full
                h-[58px]
                rounded-2xl
                font-bold
                text-base
                text-white
                transition-all
                duration-300
                ${
                  loading
                    ? `
                      bg-white/10
                      cursor-not-allowed
                    `
                    : `
                      bg-gradient-to-r
                      from-cyan-500
                      via-blue-600
                      to-purple-600
                      shadow-[0_15px_40px_rgba(37,99,235,0.30)]
                      hover:-translate-y-1
                      hover:shadow-[0_20px_50px_rgba(34,211,238,0.35)]
                      active:scale-[0.98]
                    `
                }
              `}
            >

              {!loading && (
                <span
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    -translate-x-full
                    group-hover:translate-x-full
                    transition-transform
                    duration-700
                  "
                />
              )}

              <span className="relative">
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </span>

            </button>

            {/* SIGN UP */}
            <p
              onClick={() =>
                navigate("/signup")
              }
              className="
                text-center
                text-sm
                text-white/45
                cursor-pointer
                pt-2
              "
            >
              Don't have an account?{" "}
              <span
                className="
                  text-cyan-300
                  hover:text-cyan-200
                  transition-colors
                "
              >
                Sign Up
              </span>
            </p>

          </form>

        </div>

      </main>

      {/* ANIMATIONS */}
      <style>{`

        @keyframes cardFloat {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes orbOne {
          0%, 100% {
            transform: translate(0, 0);
            opacity: .35;
          }

          50% {
            transform: translate(25px, -35px);
            opacity: .9;
          }
        }

        @keyframes orbTwo {
          0%, 100% {
            transform: translate(0, 0);
            opacity: .3;
          }

          50% {
            transform: translate(-30px, 30px);
            opacity: .85;
          }
        }

        @keyframes orbThree {
          0%, 100% {
            transform: translate(0, 0);
            opacity: .3;
          }

          50% {
            transform: translate(35px, -25px);
            opacity: .8;
          }
        }

        .animate-card-float {
          animation: cardFloat 6s ease-in-out infinite;
        }

        .animate-orb-one {
          animation: orbOne 6s ease-in-out infinite;
        }

        .animate-orb-two {
          animation: orbTwo 7s ease-in-out infinite;
        }

        .animate-orb-three {
          animation: orbThree 8s ease-in-out infinite;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          transition: background-color 5000s ease-in-out 0s;
        }

      `}</style>

    </div>
  );
}

export default SignIn;

