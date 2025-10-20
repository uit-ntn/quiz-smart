import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({
    children,
    showBackground = true,
    maxWidth = "full" // 7xl, 6xl, 5xl, 4xl, full
}) => {
    return (
        <>
            <Header />
            <div className={`relative z-10 max-w-${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
                {children}
            </div>
            <Footer />
        </>
    );
};

export default MainLayout;
