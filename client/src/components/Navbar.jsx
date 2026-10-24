import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({
  isLoggedIn,
  setIsLoggedIn,
  user,
  setUser,
}) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    setIsLoggedIn(false);
    setUser({
      name: "",
      role: "",
    });

    alert("Logged Out Successfully!");

    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container">

        <NavLink className="navbar-brand" to="/">
          📚 Library Management
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">

          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "nav-link active fw-bold text-warning"
                    : "nav-link"
                }
                to="/"
              >
                <i className="bi bi-house-door"></i> Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "nav-link active fw-bold text-warning"
                    : "nav-link"
                }
                to="/books"
              >
                <i className="bi bi-book"></i> Books
              </NavLink>
            </li>

            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active fw-bold text-warning"
                        : "nav-link"
                    }
                    to="/dashboard"
                  >
                    <i className="bi bi-speedometer2"></i> Dashboard
                  </NavLink>
                </li>

                {user?.role !== "admin" && (
                    <li className="nav-item">
                    <NavLink
                    className={({ isActive }) =>
                    isActive
                    ? "nav-link active fw-bold text-warning"
                    : "nav-link"
                    }
                    to="/mybooks"
                  >
                  <i className="bi bi-journal-bookmark"></i> My Books
                  </NavLink>
                  </li>
                )}

                {user?.role === "admin" && (
                  <>
                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "nav-link active fw-bold text-warning"
                            : "nav-link"
                        }
                        to="/admin"
                      >
                        <i className="bi bi-shield-lock"></i> Admin
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "nav-link active fw-bold text-warning"
                            : "nav-link"
                        }
                        to="/issued-books"
                      >
                       <i className="bi bi-journal-check"></i> Issued Books
                      </NavLink>
                    </li>
                  </>
                )}
              

                <li className="nav-item">
                  <button
                    className="btn btn-outline-light ms-3"
                    onClick={logout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </>
            )}

            {!isLoggedIn && (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active fw-bold text-warning"
                        : "nav-link"
                    }
                    to="/login"
                  >
                    <i className="bi bi-box-arrow-in-right"></i> Login
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active fw-bold text-warning"
                        : "nav-link"
                    }
                    to="/register"
                  >
                    <i className="bi bi-person-plus"></i> Register
                  </NavLink>
                </li>
              </>
            )}

          </ul>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;