import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BookmarkIcon, GridIcon, LogOut, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logoutUser } from "@/features/auth/slices/authSlice";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import Loader from "@/components/common/Loader";
import {
  fetchUserProfile,
  selectProfile,
  selectProfileLoading,
} from "../slices/profileSlice";
import { SettingsDialogComponent } from "@/features/user/components/SettingsDialog";

const ProfileStats = ({ label, value }) => (
  <span className="flex flex-col items-center">
    <strong>{value || 0}</strong> {label}
  </span>
);

const ProfileHeader = ({ user, onLogout }) => (
  <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
    <div className="w-32 h-32 md:w-40 md:h-40 relative">
      <img
        src={user.profilePic?.url || "/placeholder.svg"}
        alt="Profile"
        className="rounded-full object-cover w-full h-full"
      />
    </div>

    <div className="flex-1">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">{user.userName}</h1>
        <div className="flex gap-2">
          <Link to="/profile/edit">
            <Button>Update Profile</Button>
          </Link>
          <SettingsDialogComponent />
        </div>
      </div>

      <div className="flex gap-6 mb-4">
        <ProfileStats label="posts" value={user.posts?.length} />
        <ProfileStats label="followers" value={user.followers?.length} />
        <ProfileStats label="following" value={user.following?.length} />
      </div>

      <div className="max-w-2xl">
        <p className="text-gray-700">{user.bio}</p>
      </div>
    </div>
  </div>
);

const PostGrid = ({ posts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {posts.map((post) => (
      <Link
        key={post._id}
        to={`/post/${post._id}`}
        className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        <img
          src={post.image?.url || "/placeholder.svg"}
          alt={post.caption}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <p className="text-sm text-gray-600 truncate">{post.caption}</p>
        </div>
      </Link>
    ))}
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { refetchProfile } = useUserProfile();
  const user = useSelector(selectProfile);
  const isLoading = useSelector(selectProfileLoading);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      toast.error(`Logout failed: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>No user data available.</p>
        <Button onClick={refetchProfile} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader user={user} onLogout={handleLogout} />

      <div className="flex gap-4 mb-8">
        <Button onClick={handleLogout}>Logout</Button>
        <Button variant="outline" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="posts" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="posts">
            <GridIcon className="h-4 w-4 mr-2" /> Posts
          </TabsTrigger>
          <TabsTrigger value="saved">
            <BookmarkIcon className="h-4 w-4 mr-2" /> Bookmarks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {user.posts?.length > 0 ? (
            <PostGrid posts={user.posts} />
          ) : (
            <p className="text-center text-gray-500">No posts yet.</p>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {user.bookmarks?.length > 0 ? (
            <PostGrid posts={user.bookmarks} />
          ) : (
            <p className="text-center text-gray-500">No bookmarks yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
