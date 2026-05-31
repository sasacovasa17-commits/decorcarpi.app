import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          success:
            "!bg-[#1a1708] !border-[#c9a227]/40 !text-[#c9a227] [&>svg]:!text-[#c9a227]",
          toast:
            "!shadow-[0_4px_24px_rgba(201,162,39,0.15)] !rounded-lg !font-[Raleway,sans-serif]",
        },
      }}
      style={
        {
          "--normal-bg": "#0a0a0a",
          "--normal-text": "#e8e8e8",
          "--normal-border": "rgba(201,162,39,0.3)",
          "--success-bg": "#1a1708",
          "--success-text": "#c9a227",
          "--success-border": "rgba(201,162,39,0.4)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
