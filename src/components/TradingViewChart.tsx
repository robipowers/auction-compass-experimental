import { useEffect, useRef, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
}

function TradingViewChartComponent({ 
  symbol = "OANDA:EURUSD", 
  height = 500 
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      studies: ["STD;VPFR"],
      backgroundColor: "rgba(14, 18, 27, 1)",
      gridColor: "rgba(42, 46, 57, 0.3)",
    });

    containerRef.current.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        scriptLoadedRef.current = false;
      }
    };
  }, [symbol]);

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-info to-info/60 text-sm">
            📈
          </span>
          Live Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="tradingview-widget-container" 
          ref={containerRef}
          style={{ height: `${height}px` }}
        >
          <div 
            className="tradingview-widget-container__widget" 
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export const TradingViewChart = memo(TradingViewChartComponent);
