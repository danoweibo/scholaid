import type { IconProps } from "@/lib/types/auth";

export function XIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 1226.37 1226.37"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      {...props}
    >
      <path d="M727.348 519.284 1174.075 0h-105.86L680.322 450.887 370.513 0H13.185l468.492 681.821L13.185 1226.37h105.866l409.625-476.152 327.181 476.152h357.328L727.348 519.284zM582.35 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721h-162.604L582.35 687.828z" />
    </svg>
  );
}
