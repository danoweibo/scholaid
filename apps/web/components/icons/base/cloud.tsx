import type { SVGProps } from "react";

export function CloudIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      version="1.1"
      id="svg822"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 682.66669 682.66669"
      xmlSpace="preserve"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath836">
          <path d="M 0,512 H 512 V 0 H 0 Z" />
        </clipPath>
      </defs>

      <g transform="matrix(1.3333333,0,0,-1.3333333,0,682.66667)">
        <g>
          <g clipPath="url(#clipPath836)">
            <g transform="translate(432.8717,277.2236)">
              <path
                d="m 0,0 c 0.016,0.789 0.03,1.578 0.03,2.371 0,66.724 -54.09,120.814 -120.813,120.814 -47.529,0 -88.639,-27.449 -108.363,-67.355 -12.561,10.48 -28.72,16.792 -46.358,16.792 -39.655,0 -71.848,-31.88 -72.389,-71.406 -39.764,-6.636 -70.076,-41.198 -70.076,-82.846 v -0.001 c 0,-46.392 37.61,-84.001 84.002,-84.001 h 314.094 c 46.393,0 84.001,37.609 84.001,84.001 v 0.001 C 64.128,-42.085 36.8,-8.928 0,0 Z"
                stroke="currentColor"
                strokeWidth={30}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default CloudIcon;
