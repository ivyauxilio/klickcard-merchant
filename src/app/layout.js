import "./globals.css";
import Providers from "./providers";
import SessionInit from "@/components/SessionInit";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
// import Header from "@/components/Navbar";
import Header from "@/components/layout/Header";
import Notification from "@/components/ui/Notification";
import { headers } from "next/headers";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "KlickCard App",
  description: "Discount App and earn rewards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <Providers>
          <AuthProvider>
            <SidebarProvider>
              <div className="flex h-screen overflow-hidden bg-gray-50">
                <Sidebar />
                {/* <div className="flex-1 flex flex-col min-w-0 overflow-hidden"> */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-64">
                  <Header />
                  <SessionInit />
                  <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>

    // <html lang="en" className="h-full">
    //   <body className="font-body antialiased h-full bg-gray-50">
    //     <Providers>
    //       <SidebarProvider>
    //         <div className="flex h-screen overflow-hidden bg-gray-50">
    //           {/* Only show Sidebar if not on auth page */}
    //           {!isAuthPage && <Sidebar />}
    //           <div
    //             className={`flex-1 flex flex-col min-w-0 overflow-hidden ${!isAuthPage ? "md:ml-64" : ""}`}
    //           >
    //             {/* Only show Header if not on auth page */}
    //             {!isAuthPage && <Header />}
    //             <SessionInit />
    //             <main className="flex-1 overflow-y-auto p-4 md:p-6">
    //               {children}
    //             </main>
    //           </div>
    //         </div>
    //         <Notification />
    //       </SidebarProvider>
    //     </Providers>
    //   </body>
    // </html>
    // <html lang="en" className="h-full">
    //   <body className="font-body antialiased h-full bg-gray-50">
    //     <Providers>
    //       <LayoutWrapper>
    //         <SidebarProvider>{children}</SidebarProvider>
    //       </LayoutWrapper>
    //     </Providers>
    //   </body>
    // </html>
  );
}
