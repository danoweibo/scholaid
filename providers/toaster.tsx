import type { GooeyToasterProps } from "gooey-toast";
import { GooeyToaster as GooeyToasterPrimitive, gooeyToast } from "gooey-toast";
import "goey-toast/styles.css";

export { gooeyToast };
export type { GooeyToasterProps };
export type {
  GooeyToastOptions,
  GooeyPromiseData,
  GooeyToastAction,
  GooeyToastClassNames,
  GooeyToastTimings,
} from "gooey-toast";

function GooeyToaster(props: GooeyToasterProps) {
  return <GooeyToasterPrimitive position="top-center" {...props} />;
}

export { GooeyToaster };
