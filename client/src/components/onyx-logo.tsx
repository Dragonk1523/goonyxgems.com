import logoImage from "@assets/IMG_20250614_142604_1749925752446.jpg";

interface OnyxLogoProps {
  className?: string;
  size?: number;
}

export function OnyxLogo({ className = "", size = 48 }: OnyxLogoProps) {
  return (
    <img 
      src={logoImage} 
      alt="Onyx Energy Solutions Logo"
      width={size * 2.5} 
      height={size}
      className={`${className} object-contain`}
      style={{ 
        filter: 'contrast(1.2) brightness(1.1)',
        maxHeight: `${size}px`
      }}
    />
  );
}