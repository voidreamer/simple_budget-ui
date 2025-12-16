import React, { useState, useRef, useEffect } from 'react';

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, child => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen ? child : null;
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }) {
  if (asChild) {
    return React.cloneElement(children, props);
  }
  return <button {...props}>{children}</button>;
}

export function DropdownMenuContent({ children, className = '', align = 'right' }) {
  const alignClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div className={`absolute ${alignClass} mt-2 w-48 rounded-md shadow-lg bg-popover ring-1 ring-black ring-opacity-5 z-10 ${className}`}>
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = '' }) {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${className}`}
      role="menuitem"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default DropdownMenu;