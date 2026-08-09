
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/authBg.png";
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import { userDataContext } from "../context/userContext";
import axios from "axios";

function SignUp() {
  const navigate = useNavigate();

  const { serverUrl, setUserData } =
    useContext(userDataContext);

  const [showPassword, setShowPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    setErr("");
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);

      setUserData(result.data);

      navigate("/customize");
    } catch (error) {
      console.error(error);

      setUserData(null);

      setErr(
        error.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-8">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />

      {/* COLOR OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/90 via-[#071b3a]/75 to-[#16052d]/90" />

      {/* CYAN GLOW */}
      <div
        className="
          absolute
          -top-40
          -left-40
          w-[500px]
          h-[500px]
          rounded-full
          bg-cyan-400/20
          blur-[120px]
          animate-pulse
        "
      />

      {/* BLUE GLOW */}
      <div
        className="
          absolute
          -bottom-48
          -right-40
          w-[600px]
          h-[600px]
          rounded-full
          bg-blue-600/20
          blur-[140px]
          animate-pulse
        "
      />

      {/* PURPLE GLOW */}
      <div
        className="
          absolute
          top-1/3
          right-1/3
          w-[320px]
          h-[320px]
          rounded-full
          bg-purple-500/15
          blur-[120px]
        "
      />

      {/* FLOATING ORBS */}
      <div className="absolute inset-0 pointer-events-none">

        <div
          className="
            absolute
            top-[15%]
            left-[12%]
            w-3
            h-3
            rounded-full
            bg-cyan-300
            shadow-[0_0_25px_rgba(34,211,238,1)]
            animate-float-one
          "
        />

        <div
          className="
            absolute
            top-[25%]
            right-[15%]
            w-2
            h-2
            rounded-full
            bg-blue-300
            shadow-[0_0_20px_rgba(96,165,250,1)]
            animate-float-two
          "
        />

        <div
          className="
            absolute
            bottom-[20%]
            left-[18%]
            w-2
            h-2
            rounded-full
            bg-purple-300
            shadow-[0_0_20px_rgba(192,132,252,1)]
            animate-float-three
          "
        />

        <div
          className="
            absolute
            bottom-[15%]
            right-[20%]
            w-3
            h-3
            rounded-full
            bg-cyan-200
            shadow-[0_0_25px_rgba(103,232,249,1)]
            animate-float-two
          "
        />

      </div>

      {/* MAIN */}
      <div className="relative z-20 w-full max-w-[520px]">

        {/* 3D CARD */}
        <div
          className="
            relative
            rounded-[32px]
            border
            border-white/15
            bg-white/[0.08]
            backdrop-blur-2xl
            shadow-[0_30px_100px_rgba(0,0,0,0.55)]
            px-6
            py-9
            sm:px-10
            sm:py-11
            animate-card-float
          "
        >

          {/* TOP GLOW */}
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
              blur-[1px]
            "
          />

          {/* CORNER GLOW */}
          <div
            className="
              absolute
              -top-20
              -right-20
              w-40
              h-40
              rounded-full
              bg-cyan-400/10
              blur-[60px]
              pointer-events-none
            "
          />

          {/* AI ICON */}
          <div className="flex justify-center mb-6">

            <div
              className="
                relative
                w-20
                h-20
                rounded-3xl
                bg-gradient-to-br
                from-cyan-400
                via-blue-600
                to-purple-600
                p-[2px]
                shadow-[0_0_45px_rgba(34,211,238,0.30)]
                rotate-3
                hover:rotate-0
                transition-transform
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
          <div className="text-center mb-8">

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
              Create Account
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
            onSubmit={handleSignUp}
            className="space-y-5"
          >

            {/* NAME */}
            <div className="relative group">

              <input
                type="text"
                placeholder="Name"
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
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

            </div>

            {/* EMAIL */}
            <div className="relative group">

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
                  focus:border-blue-300/60
                  focus:ring-4
                  focus:ring-blue-400/10
                "
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

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
                  focus:border-purple-300/60
                  focus:ring-4
                  focus:ring-purple-400/10
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
                  <IoMdEyeOff className="text-xl" />
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

            {/* BUTTON */}
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
                    hover:translate-x-full
                    transition-transform
                    duration-700
                  "
                />
              )}

              <span className="relative">

                {loading
                  ? "Creating..."
                  : "Create Account"}

              </span>

            </button>

            {/* SIGN IN */}
            <p
              onClick={() =>
                navigate("/signin")
              }
              className="
                text-center
                text-sm
                text-white/45
                cursor-pointer
                pt-2
              "
            >
              Already have an account?{" "}
              <span
                className="
                  text-cyan-300
                  hover:text-cyan-200
                  transition-colors
                "
              >
                Sign In
              </span>
            </p>

          </form>

        </div>

      </div>

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

        @keyframes floatOne {
          0%, 100% {
            transform: translate(0, 0);
            opacity: .35;
          }

          50% {
            transform: translate(25px, -35px);
            opacity: .9;
          }
        }

        @keyframes floatTwo {
          0%, 100% {
            transform: translate(0, 0);
            opacity: .3;
          }

          50% {
            transform: translate(-30px, 30px);
            opacity: .85;
          }
        }

        @keyframes floatThree {
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

        .animate-float-one {
          animation: floatOne 6s ease-in-out infinite;
        }

        .animate-float-two {
          animation: floatTwo 7s ease-in-out infinite;
        }

        .animate-float-three {
          animation: floatThree 8s ease-in-out infinite;
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

export default SignUp;

