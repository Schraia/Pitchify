import { Link, Outlet } from "react-router-dom";

const NavbarLayout = () => {
  return (
    <div>
      <nav>
        <h1>
          Pitchify
        </h1>
        <div className="rightBtns">
          <Link className='linkers' to="/main">Home</Link>
          <Link className='linkers' to="/decks">Saved Presentations</Link>
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
