import {
  Home,
  Search,
  User,
  LogOut,
  Webhook,
  MessageSquareHeart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/features/auth/slices/authSlice";
import { CreatePostDialog } from "@/features/posts/components";

const NavItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  customComponent: CustomComponent,
}) => {
  if (CustomComponent) {
    return (
      <div className="flex items-center p-2 space-x-2">
        <CustomComponent />
      </div>
    );
  }

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      to={to}
      className="flex items-center p-2 space-x-2 transition-all duration-300 ease-in-out transform rounded-md hover:bg-gray-100 hover:scale-105"
      onClick={handleClick}
    >
      <Icon className="w-6 h-6 transition-transform duration-300 ease-in-out hover:scale-110" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export const SideNav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        toast.error(`Logout failed: ${error}`);
      });
  };

  return (
    <nav className="fixed top-0 left-0 flex-col hidden w-64 h-full p-4 bg-white border-r border-gray-200 md:flex">
      <Link to="/" className="flex items-center mb-6 space-x-2">
        <Webhook className="w-8 h-8" />
        <span className="text-xl font-bold">NodeNest</span>
      </Link>
      <div className="flex-grow">
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem customComponent={CreatePostDialog} />
        <NavItem to="/messages" icon={MessageSquareHeart} label="Messages" />
      </div>
      <div className="pt-4 mt-auto border-t border-gray-200">
        <NavItem to="/profile" icon={User} label="Profile" />
        <NavItem
          to="/logout"
          icon={LogOut}
          label="Logout"
          onClick={handleLogout}
        />
      </div>
    </nav>
  );
};

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 px-4 py-2 bg-white border-t border-gray-200 md:hidden">
    <div className="flex items-center justify-between max-w-screen-sm mx-auto">
      {[
        { to: "/", icon: Home, label: "Home" },
        { to: "/search", icon: Search, label: "Search" },
        { component: CreatePostDialog, label: "Create" },
        { to: "/messages", icon: MessageSquareHeart, label: "Messages" },
        { to: "/profile", icon: User, label: "Profile" },
      ].map((item) =>
        item.component ? (
          <item.component key={item.label} />
        ) : (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center transition-all duration-300 ease-in-out transform group hover:scale-105"
          >
            <item.icon className="w-6 h-6 transition-transform duration-300 ease-in-out hover:scale-110" />
            <span className="hidden mt-1 text-xs group-hover:block sm:block">
              {item.label}
            </span>
          </Link>
        )
      )}
    </div>
  </nav>
);
