
const LogoAnimation = ({ className }: { className: string }) => {
    return (
        <div className={`relative m-auto ${className}`}>
            {/* ring หมุนช้าไปทางซ้าย */}
            <img
                className="absolute inset-0 rounded-full bg-gradient-to-tr animate-spin-slow"
                src="/image/logo/MeCoin-Vecter-Neon-2.png"
                alt="MeCoins-ring-2"
            />

            {/* ring หมุนไปทางขวา */}
            <img
                className="absolute inset-0 rounded-full bg-gradient-to-tr animate-spin-slow-reverse"
                src="/image/logo/MeCoin-Vecter-Neon-1.png"
                alt="MeCoins-ring-1"
            />

            {/* layer ของข้อความกลาง */}
            <img
                className="absolute inset-0 rounded-full bg-gradient-to-tr animate-pulse-glow"
                src="/image/logo/MeCoin-Vecter-Neon-Text.png"
                alt="MeCoins"
            />
        </div>
    )
}

export default LogoAnimation;