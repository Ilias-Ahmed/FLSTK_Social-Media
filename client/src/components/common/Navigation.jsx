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
      <div className="flex items-center space-x-2 p-2">
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
      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
      onClick={handleClick}
    >
      <Icon className="h-6 w-6 transition-transform duration-300 ease-in-out hover:scale-110" />
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
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4">
      <Link to="/" className="flex items-center space-x-2 mb-6">
        <Webhook className="h-8 w-8" />
        <span className="text-xl font-bold">MiPedia</span>
      </Link>
      <div className="flex-grow">
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem customComponent={CreatePostDialog} />
        <NavItem to="/messages" icon={MessageSquareHeart} label="Messages" />
      </div>
      <div className="mt-auto pt-4 border-t border-gray-200">
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
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
    <div className="flex justify-between items-center max-w-screen-sm mx-auto">
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
            className="flex flex-col items-center group transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <item.icon className="h-6 w-6 transition-transform duration-300 ease-in-out hover:scale-110" />
            <span className="text-xs mt-1 hidden group-hover:block sm:block">
              {item.label}
            </span>
          </Link>
        )
      )}
    </div>
  </nav>
);
