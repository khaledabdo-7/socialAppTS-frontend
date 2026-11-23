import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { VerifyOtpModal } from "./VerifyOtpModal";
import { Globe, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { UserGender, UserRole } from "../../../types/auth.types";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<UserGender>("male");
  const [role, setRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        gender,
        role,
        provider: "system",
      });

      toast.success("Account created! Please check your email for the OTP code.");
      setIsOtpOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sphere-base transition-colors">
      <div className="w-full max-w-md p-8 bg-sphere-card border border-sphere-border rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
            style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
          >
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-sphere-main tracking-tight">
            Join Sphere
          </h2>
          <p className="text-xs text-sphere-muted">
            Create your profile and connect with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            placeholder="Khaled Abdo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sphere-muted mb-1.5">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as UserGender)}
              className="w-full h-11 px-3 rounded-xl text-xs bg-sphere-base border border-sphere-border text-sphere-main focus:outline-none focus:ring-2 focus:ring-sphere-accent/20"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            helperText="At least 8 chars, 1 uppercase, 1 number & 1 symbol"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-11 text-sm font-bold shadow-md mt-2"
          >
            Create Sphere Account
          </Button>
        </form>

        <p className="text-center text-xs text-sphere-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-sphere-main hover:underline ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>

      <VerifyOtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        email={email}
        onVerified={() => navigate("/login")}
      />
    </div>
  );
};
