import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Lock, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      toast.success("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sphere-base transition-colors">
      <div className="w-full max-w-md p-8 bg-sphere-card border border-sphere-border rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-md"
            style={{ backgroundColor: "var(--accent-glow)", color: "var(--text-main)" }}
          >
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-sphere-main tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-sphere-muted">
            Enter the OTP code from your email and set your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Recovery OTP Code"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            helperText="Minimum 8 characters"
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-11 text-sm font-bold shadow-md"
          >
            Confirm New Password
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-sphere-border">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sphere-muted hover:text-sphere-main transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
