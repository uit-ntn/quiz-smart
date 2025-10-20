import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import Header from '../components/Header';

const VocabularyLayout = ({
  children,
  breadcrumbItems = [],
  title,
  description,
  icon,
  actions,
  showBackground = true,
  maxWidth = "7xl"
}) => {
  return (
    <>
      <Header />
      <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
        {showBackground && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.02]" />
            <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/8 to-blue-400/8 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/8 to-emerald-400/8 rounded-full blur-3xl" />
          </>
        )}

        <div className={`relative z-10 max-w-${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
          {breadcrumbItems.length > 0 && (
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}

          {(title || description) && (
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {icon && (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      {icon}
                    </div>
                  )}
                  <div>
                    {title && (
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                    )}
                    {description && (
                      <p className="text-gray-600 leading-relaxed">{description}</p>
                    )}
                  </div>
                </div>
                {actions && (
                  <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
                )}
              </div>
            </div>
          )}

          <div>{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VocabularyLayout;
 
