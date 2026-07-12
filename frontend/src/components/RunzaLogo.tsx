type RunzaLogoProps = {
  className?: string;
};

export default function RunzaLogo({ className }: RunzaLogoProps) {
  return <img src="/runza-logo.svg" alt="logo" className={className} />;
}
