import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateSettings, deleteAccount } from "../slices/userSlice";
import { logoutUser } from "@/features/auth/slices/authSlice";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsDialogComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
  });

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await dispatch(updateSettings(settings)).unwrap();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount()).unwrap();
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-right">
              Enable notifications
            </Label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                handleSettingsChange("notifications", checked)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode" className="text-right">
              Dark mode
            </Label>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) =>
                handleSettingsChange("darkMode", checked)
              }
            />
          </div>
          <Separator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount}>
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveSettings}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
