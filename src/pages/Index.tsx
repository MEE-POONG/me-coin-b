import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import { useAuth } from "../contexts/AuthContext";
import { Coins, Gift } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import LogoAnimation from "../container/LogoAnimation";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // const demoLogin = async () => {
  //   toast({
  //     title: "Demo Access",
  //     description: "Use email: admin@coinquest.com and any password to login as admin.",
  //   });
  // };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative flex-grow flex flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_70%)]"></div>

        <div className="text-center max-w-3xl mx-auto mb-10">
          {/*  <div className="inline-block mb-6">
          <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-nft-purple via-nft-pink to-nft-orange blur-xl opacity-50 animate-pulse-glow"></div>
              <div className="relative bg-black/50 backdrop-blur-sm p-4 rounded-full border border-nft-purple/30">
                <Coins className="w-16 h-16 text-nft-purple animate-coin-spin" />
              </div>
              </div>
            </div> */}
          <LogoAnimation className="w-28 h-28" />

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">MeCoins</span> Wallet
          </h1>

          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Your ultimate gaming wallet with NFT-inspired aesthetics. Deposit, withdraw, and manage your digital assets in style.
          </p>

        </div>

        <div className="w-full max-w-md">
          <Card className="glass-card nft-gradient-border">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-1 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                {/* <TabsTrigger value="register">Register</TabsTrigger> */}
              </TabsList>

              <TabsContent value="login" className="p-6 pt-2">
                <LoginForm />
              </TabsContent>

              {/* <TabsContent value="register" className="p-6 pt-2">
                <RegisterForm />
              </TabsContent> */}
            </Tabs>
          </Card>
        </div>

        <div className="hidden md:flex absolute top-40 left-10 animate-float p-4 glass-card rounded-xl border border-nft-purple/20 shadow-neon">
          <div className="flex items-center gap-2">
            <Coins className="text-nft-orange w-6 h-6" />
            <span>Earn Coins</span>
          </div>
        </div>

        <div className="hidden md:flex absolute bottom-40 right-10 animate-float p-4 glass-card rounded-xl border border-nft-purple/20 shadow-neon delay-150">
          <div className="flex items-center gap-2">
            <Gift className="text-nft-pink w-6 h-6" />
            <span>Send Gifts</span>
          </div>
        </div>
      </div>

      <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-nft-purple" />
            <p className="text-sm font-medium">MeCoins Wallet</p>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} MeCoins. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
};

export default Index;
