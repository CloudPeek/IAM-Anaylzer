'use client'
import React, { useState } from 'react';
import AnalysisRoles from './AnalysisRoles';
import AnalysisUsers from './AnalysisUsers';
import AnalysisGroups from './AnalysisGroups';
import AnalysisIdentityProvider from './AnalysisIdentityProvider';

const tabs = [
  { name: 'IAM Roles', component: AnalysisRoles },
  { name: 'IAM Users', component: AnalysisUsers },
  { name: 'IAM Groups', component: AnalysisGroups },
  { name: 'IAM Identity Providers', component: AnalysisIdentityProvider },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

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
          value={selectedTab.name}
          onChange={(e) => {
            const tab = tabs.find(t => t.name === e.target.value);
            setSelectedTab(tab);
          }}
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
                onClick={() => setSelectedTab(tab)}
                className={classNames(
                  tab === selectedTab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium'
                )}
                aria-current={tab === selectedTab ? 'page' : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-4">
        <selectedTab.component />
      </div>
    </div>
  );
}
