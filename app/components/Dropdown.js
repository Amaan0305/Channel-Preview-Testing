import { useState } from 'react';

export default function Dropdown({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="mb-4">
      <button
        onClick={toggleDropdown}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full text-left"
      >
        {title}
      </button>
      {isOpen && (
        <div className="mt-2 p-4 border border-gray-300 rounded-md">
          {children}
        </div>
      )}
    </div>
  );
}
