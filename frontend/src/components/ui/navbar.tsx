import { NavLink } from "react-router-dom";
import "./Navbar.css";

export const navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">The Quad</div>
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/markets"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Markets
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Leaderboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/create-market"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Create Market
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
