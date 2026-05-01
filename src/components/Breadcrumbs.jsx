import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = ({ customPaths }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If customPaths is provided (e.g., for product details), use it instead of parsing location
  const paths = customPaths || pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    return { name: name.charAt(0).toUpperCase() + name.slice(1), routeTo, isLast };
  });

  return (
    <nav className="flex py-4 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="hover:text-[#febd69] transition-colors">Home</Link>
        </li>
        {paths.map((path, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="text-gray-600">/</span>
            {path.isLast ? (
              <span className="text-gray-300 font-medium truncate max-w-[150px] md:max-w-xs">
                {path.name}
              </span>
            ) : (
              <Link to={path.routeTo} className="hover:text-[#febd69] transition-colors">
                {path.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
