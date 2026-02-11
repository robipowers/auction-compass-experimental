import { useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";

// TradingView widget types
declare global {
  interface Window {
    TradingView: {
      widget: new (config: TradingViewWidgetConfig) => TradingViewWidget;
    };
  }
}

interface TradingViewWidgetConfig {
  autosize?: boolean;
  symbol: string;
  interval: string;
  timezone?: string;
  theme?: "light" | "dark";
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
  hide_side_toolbar?: boolean;
  hide_top_toolbar?: boolean;
  withdateranges?: boolean;
  details?: boolean;
  hotlist?: boolean;
  calendar?: boolean;
  studies?: string[];
  show_popup_button?: boolean;
  popup_width?: string;
  popup_height?: string;
  save_image?: boolean;
  hide_volume?: boolean;
  support_host?: string;
}

interface TradingViewWidget {
  remove: () => void;
}

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: "light" | "dark";
  autosize?: boolean;
  hideToolbar?: boolean;
  hideSideToolbar?: boolean;
  studies?: string[];
  className?: string;
  onLoad?: () => void;
}

const TRADINGVIEW_SCRIPT_ID = "tradingview-widget-script";
const TRADINGVIEW_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

function TradingViewChartComponent({
  symbol = "NQ1!",
  interval = "5",
  theme = "dark",
  autosize = true,
  hideToolbar = false,
  hideSideToolbar = false,
  studies = [],
  className,
  onLoad,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<TradingViewWidget | null>(null);

  useEffect(() => {
    // Load TradingView script if not already loaded
    let script = document.getElementById(TRADINGVIEW_SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = TRADINGVIEW_SCRIPT_ID;
      script.src = TRADINGVIEW_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    const initWidget = () => {
      if (!containerRef.current || !window.TradingView) return;

      // Clean up previous widget
      if (widgetRef.current) {
        widgetRef.current.remove();
      }

      const containerId = `tradingview_${Date.now()}`;
      containerRef.current.id = containerId;

      widgetRef.current = new window.TradingView.widget({
        autosize,
        symbol,
        interval,
        timezone: "America/Chicago",
        theme,
        style: "1", // Candlestick
        locale: "en",
        toolbar_bg: "#080808",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerId,
        hide_side_toolbar: hideSideToolbar,
        hide_top_toolbar: hideToolbar,
        withdateranges: true,
        details: false,
        hotlist: false,
        calendar: false,
        studies: studies.length > 0 ? studies : undefined,
        show_popup_button: false,
        save_image: true,
        hide_volume: false,
      });

      onLoad?.();
    };

    if (window.TradingView) {
      initWidget();
    } else {
      script.addEventListener("load", initWidget);
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol, interval, theme, autosize, hideToolbar, hideSideToolbar, studies, onLoad]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full min-h-[400px] bg-background", className)}
    />
  );
}

// Memoize to prevent unnecessary re-renders
export const TradingViewChart = memo(TradingViewChartComponent);
export default TradingViewChart;
