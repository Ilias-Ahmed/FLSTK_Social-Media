import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileSchema } from "@/schemas/updateProfileSchema";
import { toast } from "sonner";
import { Upload, ArrowLeft } from "lucide-react";
import Loader from "@/components/common/Loader";
import {
  updateUserProfile,
  selectProfile,
  selectProfileLoading,
  fetchUserProfile,
} from "../slices/profileSlice";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageUpload = ({ previewUrl, user, onChange }) => (
  <div className="mb-6 flex items-center gap-4">
    <Avatar className="w-20 h-20 border-2 border-gray-200">
      <AvatarImage
        src={previewUrl || user?.profilePic?.url || "/placeholder.svg"}
        alt={`${user?.userName}'s profile picture`}
        className="object-cover"
      />
      <AvatarFallback className="bg-primary/10">
        {user?.userName?.charAt(0).toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        id="profilePic"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Change profile picture"
      />
      <Button
        variant="outline"
        className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
      >
        <Upload size={16} />
        Change Profile Picture
      </Button>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="animate-spin h-8 w-8 text-primary" />
  </div>
);

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectProfile);
  const isLoading = useSelector(selectProfileLoading);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      form.reset({ bio: user.bio || "" });
    }
  }, [user, form]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndSetImage = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size should be less than 5MB");
      return false;
    }

    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateAndSetImage(file)) {
      setProfilePic(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  };

  const handleSubmit = async (data) => {
    const formData = new FormData();
    formData.append("bio", data.bio.trim());
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (!user) return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <ImageUpload
        previewUrl={previewUrl}
        user={user}
        onChange={handleImageChange}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Tell us about yourself"
                    className="resize-none h-32 focus:ring-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateProfile;
