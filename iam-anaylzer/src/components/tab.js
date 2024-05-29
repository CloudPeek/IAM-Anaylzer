import React, { useState } from 'react';
import AnalysisRoles from './AnalysisRoles';  // Your existing roles analysis component
import AnalysisUsers from './AnalysisUsers';  // Placeholder for users analysis component
import AnalysisGroups from './AnalysisGroups';  // Placeholder for groups analysis component
import AnalysisIdentityProvider from './AnalysisIdentityProvider';  // Placeholder for identity provider analysis component

const tabs = [
  { name: 'IAM Roles', href: '#', current: true },
  { name: 'IAM Users', href: '#', current: false },
  { name: 'IAM Groups', href: '#', current: false },
  { name: 'Identity Providers', href: '#', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example() {
  const [currentTab, setCurrentTab] = useState('IAM Roles');

  const renderContent = () => {
    switch (currentTab) {
      case 'IAM Roles':
        return <AnalysisRoles />;
      case 'IAM Users':
        return <AnalysisUsers />;
      case 'IAM Groups':
        return <AnalysisGroups />;
      case 'Identity Providers':
        return <AnalysisIdentityProvider />;
      default:
        return <AnalysisRoles />;
    }
  };

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.current).name}
          onChange={(e) => setCurrentTab(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href="#"
                onClick={() => setCurrentTab(tab.name)}
                className={classNames(
                  tab.name === currentTab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium'
                )}
                aria-current={tab.name === currentTab ? 'page' : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}
