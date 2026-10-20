// This package is the only app-facing boundary to Concorde. The V2 files it
// exports were installed verbatim from the official registry and locked in the
// V2 source manifest; route code never imports the library directly.
export { default as Header } from "../../../apps/index-lab/concorde/bloques/header/desktop/Header";
export type { HeaderProps } from "../../../apps/index-lab/concorde/bloques/header/desktop/Header";

export { default as Sidebar } from "../../../apps/index-lab/concorde/bloques/sidebar/desktop/Sidebar";
export type { SidebarNavItem, SidebarProps } from "../../../apps/index-lab/concorde/bloques/sidebar/desktop/Sidebar";

export { default as PromoBanner } from "../../../apps/index-lab/concorde/bloques/banners/desktop/PromoBanner";
export type { PromoBannerProps, PromoLayout, PromoTone } from "../../../apps/index-lab/concorde/bloques/banners/desktop/PromoBanner";

export { default as OfferShelf } from "../../../apps/index-lab/concorde/components/OfferShelf";
export type { OfferShelfItem, OfferShelfProps } from "../../../apps/index-lab/concorde/components/OfferShelf";
export { default as Homepage } from "../../../apps/index-lab/concorde/bloques/homepage/desktop/Homepage";
export { HOMEPAGE_WIDTH, HOMEPAGE_HEIGHT } from "../../../apps/index-lab/concorde/bloques/homepage/desktop/dimensions";
export { default as AuctioneerSection } from "../../../apps/index-lab/concorde/bloques/homepage/desktop/AuctioneerSection";
export type { AuctioneerSectionProps } from "../../../apps/index-lab/concorde/bloques/homepage/desktop/AuctioneerSection";
export type { HomepageProps } from "../../../apps/index-lab/concorde/bloques/homepage/desktop/Homepage";
export { default as HomepageMobile } from "../../../apps/index-lab/concorde/bloques/homepage/mobile/HomepageMobile";
export type { HomepageMobileProps } from "../../../apps/index-lab/concorde/bloques/homepage/mobile/HomepageMobile";
export { default as CategoriesSection } from "../../../apps/index-lab/concorde/bloques/homepage/desktop/CategoriesSection";
export type { CategoriesSectionProps } from "../../../apps/index-lab/concorde/bloques/homepage/desktop/CategoriesSection";

export { default as Button, UserIcon } from "../../../apps/index-lab/concorde/components/Button";
export type { ButtonProps } from "../../../apps/index-lab/concorde/components/Button";
export { default as BadgeStatus } from "../../../apps/index-lab/concorde/components/BadgeStatus";
export type { BadgeStatusProps } from "../../../apps/index-lab/concorde/components/BadgeStatus";
export { default as LikeButton } from "../../../apps/index-lab/concorde/components/LikeButton";
export type { LikeButtonProps } from "../../../apps/index-lab/concorde/components/LikeButton";
export { default as OfferCard } from "../../../apps/index-lab/concorde/components/OfferCard";
export type { OfferCardProps } from "../../../apps/index-lab/concorde/components/OfferCard";
export { default as OfferType } from "../../../apps/index-lab/concorde/components/OfferType";
export type { OfferTypeProps } from "../../../apps/index-lab/concorde/components/OfferType";
export { default as CategoryCard } from "../../../apps/index-lab/concorde/components/CategoryCard";
export type { CategoryCardProps } from "../../../apps/index-lab/concorde/components/CategoryCard";
export { default as CardTitle } from "../../../apps/index-lab/concorde/components/CardTitle";
export type { CardTitleProps } from "../../../apps/index-lab/concorde/components/CardTitle";
export { default as ProfileButton } from "../../../apps/index-lab/concorde/components/ProfileButton";
export type { ProfileButtonProps } from "../../../apps/index-lab/concorde/components/ProfileButton";
export {
  default as SidebarMobile,
  HamburgerIcon,
  SidebarMenuButton,
} from "../../../apps/index-lab/concorde/bloques/sidebar/mobile/SidebarMobile";
export type { SidebarMobileProps } from "../../../apps/index-lab/concorde/bloques/sidebar/mobile/SidebarMobile";
