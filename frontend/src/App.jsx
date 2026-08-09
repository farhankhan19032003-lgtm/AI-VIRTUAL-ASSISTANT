
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { userDataContext } from "./context/userContext";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";
import Home from "./pages/Home";

function App() {
  const {
    userData,
    loadingUser,
  } = useContext(userDataContext);

  console.log("APP USER DATA:", userData);
  console.log("APP USER LOADING:", loadingUser);

  // =====================================================
  // WAIT FOR CURRENT USER API
  // =====================================================

  if (loadingUser) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20" />

            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-blue-500 animate-spin" />
          </div>

          <p className="text-cyan-100/70 text-sm tracking-wider">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>

      {/* =================================================
          HOME
      ================================================= */}

      <Route
        path="/"
        element={
          userData ? (
            userData.assistantImage &&
            userData.assistantName ? (
              <Home />
            ) : (
              <Navigate
                to="/customize"
                replace
              />
            )
          ) : (
            <Navigate
              to="/signin"
              replace
            />
          )
        }
      />

      {/* =================================================
          HOME ALIAS
      ================================================= */}

      <Route
        path="/home"
        element={
          userData ? (
            userData.assistantImage &&
            userData.assistantName ? (
              <Home />
            ) : (
              <Navigate
                to="/customize"
                replace
              />
            )
          ) : (
            <Navigate
              to="/signin"
              replace
            />
          )
        }
      />

      {/* =================================================
          SIGN IN
      ================================================= */}

      <Route
        path="/signin"
        element={
          !userData ? (
            <SignIn />
          ) : (
            <Navigate
              to="/"
              replace
            />
          )
        }
      />

      {/* =================================================
          SIGN UP
      ================================================= */}

      <Route
        path="/signup"
        element={
          !userData ? (
            <SignUp />
          ) : (
            <Navigate
              to="/customize"
              replace
            />
          )
        }
      />

      {/* =================================================
          CUSTOMIZE
      ================================================= */}

      <Route
        path="/customize"
        element={
          userData ? (
            <Customize />
          ) : (
            <Navigate
              to="/signin"
              replace
            />
          )
        }
      />

      {/* =================================================
          CUSTOMIZE 2
      ================================================= */}

      <Route
        path="/customize2"
        element={
          userData ? (
            <Customize2 />
          ) : (
            <Navigate
              to="/signin"
              replace
            />
          )
        }
      />

      {/* =================================================
          404
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;

