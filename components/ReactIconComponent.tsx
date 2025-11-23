import React from 'react';
import * as FaIcons from 'react-icons/fa';

interface ReactIconComponentProps {
  icon: keyof typeof FaIcons;
  setClass?: string;
}

const ReactIconComponent: React.FC<ReactIconComponentProps> = ({ icon, setClass = '' }) => {
  const IconComponent = FaIcons[icon] as React.ComponentType<{ className?: string }>;

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={setClass} />;
};

export default ReactIconComponent;
