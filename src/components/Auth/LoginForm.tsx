
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await login(username, password);

      if (success) {
        toast({
          title: "Success",
          description: "Welcome back to MeCoins Wallet!",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="login-page">
      <form className="space-y-6" onSubmit={handleSubmit} >
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="your.username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-black/30 border-nft-purple/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/30 border-nft-purple/30"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-nft-purple hover:bg-nft-purple/80 animate-pulse-glow"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="flex mt-4 justify-between">
        <Link to="/register" className="text-nft-purple hover:underline">Register</Link>
        <Link to="/forgot-password" className="text-nft-purple hover:underline">Forgot Password</Link>
      </div>
    </div>
  );
};

export default LoginForm;
