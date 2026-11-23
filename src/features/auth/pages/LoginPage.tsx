import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../../../store/auth.store";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Globe, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sphere-base transition-colors">
      <div className="w-full max-w-md p-8 bg-sphere-card border border-sphere-border rounded-3xl shadow-2xl space-y-6">
        {/* Sphere Logo & Headline */}
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
            style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
          >
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-sphere-main tracking-tight">
            Sphere
          </h2>
          <p className="text-xs text-sphere-muted">
            Enter your dimension and connect with your community
          </p>
        </div>

        {/* Login Form */}
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

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-sphere-muted hover:text-sphere-main transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-11 text-sm font-bold shadow-md"
          >
            Sign In to Sphere
          </Button>
        </form>

        {/* Register Redirection */}
        <div className="text-center pt-2 border-t border-sphere-border">
          <p className="text-xs text-sphere-muted">
            New to Sphere?{" "}
            <Link
              to="/register"
              className="font-bold text-sphere-main hover:underline ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
