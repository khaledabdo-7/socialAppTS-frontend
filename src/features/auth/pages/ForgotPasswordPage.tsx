import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.forgetPassword(email.trim().toLowerCase());
      toast.success("Password reset OTP code sent to your email!");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send reset code");
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
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-sphere-main tracking-tight">
            Forgot Password
          </h2>
          <p className="text-xs text-sphere-muted">
            Enter your account email to receive a recovery OTP code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-11 text-sm font-bold shadow-md"
          >
            Send OTP Code
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
