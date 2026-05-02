/* TYPE DEFINITIONS
 * =================
 * This file contains type definitions for the project.
 * It is used to define types that are used throughout the project,
 * such as props for components, types for API responses, etc.
 */

export type IconProps = React.SVGProps<SVGSVGElement>;
export type ModalType = "phone" | "email" | "meeting" | "chat" | null;
export type SubModalType = "liveChat" | null;

export interface DropdownItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  subtitle: string;
  action: () => void;
}

export interface PortfolioHero {
  greeting: string;
  tagline: string;
  description: string;
  image: string;
}

export interface PortfolioCareer {
  id: string;
  role: string;
  company: string;
  duration: string;
  banner: string;
  contributions: string[];
  stacks: { name: string; icon: string }[];
  images: string[];
}

export interface PortfolioProducts {
  id: string;
  icon: string;
  name: string;
  description: string;
  solves: string[];
  stacks: {
    name: string;
    icon: string;
  }[];
  images: string[];
}

export interface PortfolioSkills {
  label: string;
  icon: string;
}

export interface PortfolioFooter {
  tagline: string;
  socials: {
    platform: string;
    handle: string;
    url: string;
  }[];
  copyright: {
    base: string;
    role: string;
  };
}
