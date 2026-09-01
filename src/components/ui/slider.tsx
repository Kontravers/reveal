import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

type SliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  className?: string;
  "aria-label"?: string;
};

export function Slider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(next) => onValueChange(next[0] ?? value)}
      aria-label={ariaLabel}
      className={cn(
        "relative flex h-11 w-full touch-none items-center select-none",
        className,
      )}
    >
      <SliderPrimitive.Track className="relative h-0.5 w-full grow rounded-full bg-line">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-ink" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-3.5 rounded-full bg-ink shadow-[0_0_0_1px_rgba(20,20,19,0.12),0_1px_2px_rgba(20,20,19,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30" />
    </SliderPrimitive.Root>
  );
}
