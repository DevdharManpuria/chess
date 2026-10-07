import { useLocation } from "react-router-dom";
import PillNav from "./PillNav";

const chessLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M19.333 13.923c-.765 0-1.428-.485-1.688-1.18l-1.396-3.722A2.001 2.001 0 0014.379 8h-4.758a2 2 0 00-1.87 1.34l-1.396 3.72a1.8 1.8 0 01-1.688 1.18H3v2h2.5c.376 0 .732.19.938.508l2.125 3.293A2 2 0 0010.242 21h3.516a2 2 0 001.679-1.077l2.125-3.293a1.12 1.12 0 01.938-.508H21v-2h-1.667zM12 2C9.243 2 7 4.243 7 7v1h10V7c0-2.757-2.243-5-5-5z'/></svg>";

// Created once, outside the component, so it's the same array on every render
const NAV_ITEMS = [
    { label: "Home", href: "/" },
    { label: "Play", href: "/game" },
];

export const SiteNav = () => {
    const { pathname } = useLocation();

    return (
        <div className="relative z-[1000] w-full flex justify-center mt-6 [&>div]:!relative [&>div]:!top-0 [&>div]:!left-0">
            <PillNav
                logo={chessLogo}
                logoAlt="DevChess"
                items={NAV_ITEMS}
                activeHref={pathname}
                baseColor="#ffffff"
                pillColor="#120F17"
                hoveredPillTextColor="#120F17"
                pillTextColor="#ffffff"
                className="shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/5"
            />
        </div>
    );
};