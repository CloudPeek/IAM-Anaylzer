// src/app/anaylsis/AnalysisUsers.js
'use client'
import React, { useEffect, useState } from 'react';
import { fetchIAMUsers } from '@/components/AWSHelper/fetchIAMUsers';
import { AWSStsReturns } from '@/components/AWSHelper/AWSStsReturns';
import ErrorNotification from '@/components/Error';
import OverlayOne from '@/components/OverlayOne';

const AnalysisUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [iamRole, setIamRole] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    async function fetchUsersAndArn() {
      try {
        const roleArn = await AWSStsReturns();
        setIamRole(roleArn);

        const fetchedUsers = await fetchIAMUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        setError('Failed to fetch IAM users or ARN');
        setShowError(true);
        console.error('Failed to fetch IAM users or ARN:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsersAndArn();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowOverlay(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">IAM Users</h1>
          <p className="mt-2 text-sm text-gray-700">Analysis of IAM users which are accessible to {iamRole}.</p>
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
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-0">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Created On
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Meets Best Practice
                    </th>                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Security Concerns
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-0">
                    Access Key count  
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-0">
                      Number of Inline policies
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-0">
                      Number of attached policies
                    </th>                    

                    <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-0 text-gray-500">
                      <span className="sr-only">More Info</span>
                      More Info
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} onClick={() => handleUserClick(user)} className="cursor-pointer">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(user.created).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.bestPractice}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.securityConcerns}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.accessKeysCount}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.inlinePoliciesCount}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.attachedPoliciesCount}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          More Info<span className="sr-only">, {user.name}</span>
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
      {selectedUser && <OverlayOne open={showOverlay} setOpen={setShowOverlay} entity={selectedUser} />}
      <ErrorNotification message={error} show={showError} setShow={setShowError} />
    </div>
  );
}

export default AnalysisUsers;
