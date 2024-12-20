"use client"
import { Logo } from "@/components/design_system/structure/logo"
import Panel from "@/components/design_system/structure/panel"
import Image from "next/image"
import { productsData } from "@/components/products/products"
import { MenuSideProduct } from "@/components/products/product_nav/menu_side_product"

import { cn } from "@/lib/utils"
import { useNavigationContext } from "./navigation_context"

export function MenuSide() {
  const { isOpen, setIsOpen } = useNavigationContext()
  return (
    <nav className={cn("absolute z-10 flex h-full items-center justify-between gap-2 lg:relative", !isOpen && "hidden lg:flex")}>
      <Panel className={cn("h-full min-h-[98dvh] !p-0 transition-all duration-300 ease-in-out", !isOpen ? "w-[80px]" : "w-[250px]")}>
        <Panel className="!p-2 text-3xl">
          <div className="flex items-center">
            <Logo className="h-16 w-16" />
            <span className={cn("overflow-x-hidden", !isOpen && "hidden")}>Tangent</span>
          </div>
        </Panel>
        <div className={cn("mt-6 flex flex-col gap-4 px-2", isOpen ? "px-2" : "px-1")}>
          {[productsData.wrapper, productsData.splitter, productsData.booster].map((productData) => (
            <MenuSideProduct key={productData.key} productData={productData} isOpen={isOpen} />
          ))}
          {/* Product TGUSD  ---------------------------------------- */}

          <div>
            <div className={cn("ml-4 flex items-center gap-5 overflow-x-clip text-gray-700 duration-200", !isOpen ? "hidden opacity-0" : "opacity-100")}>
              <div className="mr-2 flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image width={40} height={40} src="/medias/product_tgusd.png" alt="tg USD" />
                  <span className="font-semibold text-gray-700">tgUSD</span>
                </div>
                <span className="rounded-full bg-button-active px-4 py-1 text-black">Soon</span>
              </div>
            </div>
          </div>
          {/* Docs  ---------------------------------------- */}
          <hr className="border-gray-600" />
          <div className="">
            <a className={cn("flex items-center gap-3 overflow-x-clip", isOpen ? "ml-4" : "p-2")} href="#">
              <svg width="28" height="20" className="ml-2" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.6021 16.6735C12.7098 16.6737 12.8164 16.6949 12.9159 16.7359C13.0153 16.7769 13.1057 16.8369 13.1817 16.9125C13.2578 16.9882 13.3181 17.0779 13.3591 17.1766C13.4002 17.2753 13.4213 17.3811 13.4211 17.4878C13.421 17.5946 13.3996 17.7003 13.3582 17.7989C13.3168 17.8975 13.2563 17.987 13.18 18.0624C13.1038 18.1379 13.0133 18.1976 12.9137 18.2383C12.8141 18.279 12.7074 18.2999 12.5997 18.2997C12.3822 18.2995 12.1737 18.2135 12.0201 18.0608C11.8665 17.9081 11.7804 17.7012 11.7808 17.4855C11.781 17.2699 11.8678 17.0632 12.0218 16.9109C12.1758 16.7587 12.3846 16.6733 12.6021 16.6735ZM25.4636 11.6458C25.3559 11.6457 25.2493 11.6246 25.1498 11.5837C25.0503 11.5427 24.96 11.4827 24.8838 11.4072C24.8077 11.3316 24.7474 11.242 24.7063 11.1433C24.6651 11.0446 24.644 10.9389 24.644 10.8321C24.6441 10.7253 24.6654 10.6196 24.7067 10.521C24.748 10.4223 24.8084 10.3328 24.8846 10.2573C24.9609 10.1819 25.0513 10.122 25.1509 10.0812C25.2504 10.0404 25.3571 10.0195 25.4648 10.0196C25.6823 10.0197 25.8909 10.1055 26.0446 10.2581C26.1983 10.4107 26.2845 10.6176 26.2844 10.8332C26.2843 11.0489 26.1977 11.2556 26.0438 11.408C25.8899 11.5604 25.6812 11.6459 25.4636 11.6458ZM25.4636 8.31931C24.7911 8.31991 24.1464 8.58504 23.6709 9.05647C23.1953 9.5279 22.9279 10.1671 22.9273 10.8338C22.9273 11.1033 22.9728 11.3716 23.0614 11.633L14.6835 16.0548C14.4511 15.7204 14.1403 15.447 13.7777 15.2582C13.4151 15.0694 13.0116 14.9709 12.6021 14.9711C11.6349 14.9711 10.754 15.5204 10.3271 16.3775L2.80076 12.4426C2.00508 12.0286 1.41007 10.7309 1.47308 9.54882C1.50574 8.9323 1.72042 8.4535 2.04825 8.26846C2.25592 8.15275 2.50559 8.16203 2.77159 8.29967L2.82059 8.32628C4.81563 9.36723 11.342 12.7757 11.6174 12.9018C12.0409 13.0973 12.2766 13.1759 12.9999 12.8359L26.4915 5.88005C26.6899 5.80598 26.9208 5.6175 26.9208 5.33178C26.9208 4.93625 26.5066 4.78006 26.5066 4.78006C25.739 4.41574 24.5594 3.86869 23.4091 3.3343C20.9498 2.19273 18.1625 0.899633 16.9387 0.263497C15.8817 -0.284739 15.0311 0.177905 14.8795 0.270437L14.5855 0.415012C9.07633 3.11568 1.70291 6.7359 1.2829 6.98919C0.532727 7.4426 0.067219 8.34591 0.0065514 9.46669C-0.0867833 11.2444 0.82673 13.0985 2.13458 13.7774L10.0937 17.8464C10.1814 18.4441 10.4831 18.9906 10.9436 19.386C11.4041 19.7814 11.9928 19.9993 12.6021 20C13.2675 19.9988 13.9059 19.7389 14.38 19.2761C14.8541 18.8132 15.126 18.1844 15.1373 17.5249L23.9038 12.8139C24.3471 13.1586 24.899 13.3472 25.4636 13.3472C26.1361 13.3465 26.7809 13.0814 27.2564 12.61C27.7319 12.1386 27.9994 11.4994 28 10.8326C27.9994 10.1659 27.7319 9.52674 27.2564 9.05532C26.7809 8.58389 26.1361 8.31876 25.4636 8.31815"
                  fill="white"
                />
              </svg>
              <span className={cn(!isOpen && "hidden")}>Docs</span>
            </a>
          </div>
        </div>
      </Panel>
      <Panel
        className={cn("mr-2 flex h-36 !w-[25px] cursor-pointer items-center justify-center !p-0")}
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        <svg width="9" className={cn(!isOpen && "rotate-180")} height="41" viewBox="0 0 9 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1L2 20.6639L8 40" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Panel>
    </nav>
  )
}
