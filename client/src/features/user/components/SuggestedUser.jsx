import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserPlus, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchSuggestedUsers,
  followUser,
  dismissSuggestedUser,
} from "../slices/userSlice";

export const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers, isLoading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  const handleFollow = (userId) => {
    dispatch(followUser(userId));
  };

  const handleDismiss = (userId) => {
    dispatch(dismissSuggestedUser(userId));
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!suggestedUsers?.length) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Suggested Users</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {suggestedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profilePic?.url} alt={user.userName} />
                  <AvatarFallback>{user.userName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.userName}</h3>
                  <p className="text-xs text-gray-400">
                    {user.followers?.length || 0} followers
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                  onClick={() => handleFollow(user._id)}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Follow</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleDismiss(user._id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
