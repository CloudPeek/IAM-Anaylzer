'use client'
import React, { useEffect, useState } from 'react';
import { fetchIAMRoles, AWSStsReturns } from '@/components/AWSHelper';
import ErrorNotification from '@/components/Error';
import Overlay from '@/components/Overlay';

const statuses = {
  Complete: 'text-green-700 bg-green-50 ring-green-600/20',
  'In progress': 'text-gray-600 bg-gray-50 ring-gray-500/10',
  Archived: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const CACHE_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function Analysis() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [iamRole, setIamRole] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    async function fetchRolesAndArn() {
      try {
        const cachedRoles = localStorage.getItem('iamRoles');
        const cachedArn = localStorage.getItem('iamRoleArn');
        const cacheTimestamp = localStorage.getItem('cacheTimestamp');
        const currentTime = new Date().getTime();

        if (cachedRoles && cachedArn && cacheTimestamp && (currentTime - cacheTimestamp < CACHE_INTERVAL)) {
          setRoles(JSON.parse(cachedRoles));
          setIamRole(cachedArn);
          setLoading(false);
        } else {
          const roleArn = await AWSStsReturns();
          setIamRole(roleArn);
          localStorage.setItem('iamRoleArn', roleArn);

          const fetchedRoles = await fetchIAMRoles();
          setRoles(fetchedRoles);
          localStorage.setItem('iamRoles', JSON.stringify(fetchedRoles));
          localStorage.setItem('cacheTimestamp', currentTime);
        }
      } catch (error) {
        setError('Failed to fetch IAM roles or ARN');
        setShowError(true);
        console.error('Failed to fetch IAM roles or ARN:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRolesAndArn();

    const interval = setInterval(fetchRolesAndArn, CACHE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setShowOverlay(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">IAM Roles</h1>
          <p className="mt-2 text-sm text-gray-700">
            Analysis of IAM roles which are accessible to {iamRole}.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        {loading ? (
          <p className="text-black">Loading...</p>
        ) : (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Created On
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Number of Inline policies
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Number of Attached policies
                    </th>
                    <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-0 text-gray-500">
                      <span className="sr-only">More Info</span>
                      More Info
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {roles.map((role) => (
                    <tr key={role.id} onClick={() => handleRoleClick(role)} className="cursor-pointer">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {role.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={classNames(
                            statuses[role.status] || 'text-gray-600 bg-gray-50 ring-gray-500/10',
                            'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                          )}
                        >
                          {role.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(role.created).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {role.inlinePoliciesCount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {role.attachedPoliciesCount}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          More Info<span className="sr-only">, {role.name}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {selectedRole && <Overlay open={showOverlay} setOpen={setShowOverlay} role={selectedRole} />}
      <ErrorNotification message={error} show={showError} setShow={setShowError} />
    </div>
  );
}
