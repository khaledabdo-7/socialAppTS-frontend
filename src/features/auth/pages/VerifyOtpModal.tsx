import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { authApi } from "../api/auth.api";
import { toast } from "sonner";
import { ShieldCheck, RefreshCw } from "lucide-react";

interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
}

export const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerified,
}) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyOtp({ email, otp: otp.trim() });
      toast.success("Account verified successfully! You can now log in.");
      onVerified();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendOtp(email);
      toast.success("A new OTP code has been sent to your email!");
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Email Account"
      description={`Enter the 6-digit verification code sent to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <Input
          placeholder="Enter 6-digit OTP code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="text-center font-mono tracking-widest text-lg font-bold"
          autoFocus
          required
        />

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>Didn't receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0}
            className="text-primary-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Verify & Continue
        </Button>
      </form>
    </Modal>
  );
};

