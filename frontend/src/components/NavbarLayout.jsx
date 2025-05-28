import { Link, Outlet, useNavigate } from "react-router-dom";
import { FiPower } from "react-icons/fi";

const NavbarLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div>
      <nav>
        <h1>
          Pitchify
        </h1>
        <div className="rightBtns">
          <Link className='linkers' to="/main">Home</Link>
          <Link className='linkers' to="/decks">Saved Presentations</Link>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: "10px",
              verticalAlign: "middle",
              padding: 0
            }}
            title="Log Off"
          >
            <FiPower style={{ fontSize: 28, color: "#FF047D", verticalAlign: "middle" }} />
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default NavbarLayout;
