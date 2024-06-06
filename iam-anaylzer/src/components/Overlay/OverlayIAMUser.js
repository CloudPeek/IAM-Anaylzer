import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { decodeAndParseJson } from '@/utils/decodeAndParseJson';
import { analyzePolicyOnRequest } from '@/components/AWSHelper/analyzePolicyOnRequest';

const OverlayIAMUser = ({ open, setOpen, user }) => {
  const [analysisResults, setAnalysisResults] = useState({});
  const [loadingPolicies, setLoadingPolicies] = useState({});

  useEffect(() => {
    if (!user) {
      console.error('No user data available.');
    }
  }, [user]);

  const handleAnalyzePolicy = async (policyName, policyDocument) => {
    const cachedAnalysis = localStorage.getItem(`analysis_${policyName}`);
    if (cachedAnalysis) {
      setAnalysisResults((prevResults) => ({
        ...prevResults,
        [policyName]: cachedAnalysis,
      }));
      return;
    }

    const apiKey = localStorage.getItem('openaiApiKey');
    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return;
    }

    setLoadingPolicies((prev) => ({ ...prev, [policyName]: true }));

    const analysis = await analyzePolicyOnRequest(apiKey, policyDocument);
    setAnalysisResults((prevResults) => ({
      ...prevResults,
      [policyName]: analysis,
    }));
    setLoadingPolicies((prev) => ({ ...prev, [policyName]: false }));
    localStorage.setItem(`analysis_${policyName}`, analysis);
  };

  return (
    <Transition show={open}>
      <Dialog className="relative z-10" onClose={() => setOpen(false)}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-black">
                          User Details
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {user ? (
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <p className="text-sm text-black"><strong>Name:</strong> {user.name}</p>
                        <p className="text-sm text-black"><strong>ARN:</strong> {user.arn}</p>
                        <p className="text-sm text-black"><strong>Created On:</strong> {new Date(user.created).toLocaleString()}</p>
                        <p className="text-sm text-black"><strong>Access Keys Count:</strong> {user.accessKeysCount}</p>
                        <p className="text-sm text-black"><strong>Access Keys Created Dates:</strong> {user.accessKeysCreatedDates.map(date => new Date(date).toLocaleString()).join(', ')}</p>
                        <p className="text-sm text-black"><strong>Groups:</strong> {user.groups.join(', ')}</p>
                        <p className="text-sm text-black"><strong>Console Sign-In Link:</strong> <a href={user.consoleSignInLink} target="_blank" rel="noopener noreferrer">{user.consoleSignInLink}</a></p>
                        <div className="mt-4">
                          <h4 className="text-md font-semibold text-black">Inline Policies</h4>
                          {user.inlinePolicies && user.inlinePolicies.length > 0 ? (
                            user.inlinePolicies.map((policy, index) => (
                              <div key={index} className="mt-2">
                                <p className="text-sm text-black"><strong>Policy Name:</strong> {policy.PolicyName}</p>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto text-black">
                                  <code>{decodeAndParseJson(policy.PolicyDocument)}</code>
                                </pre>
                                <button
                                  onClick={() => handleAnalyzePolicy(policy.PolicyName, policy.PolicyDocument)}
                                  className="mt-2 py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  Analyze Policy
                                </button>
                                {loadingPolicies[policy.PolicyName] && (
                                  <p className="text-sm text-black mt-2"><strong>AI Analysis:</strong> Analyzing data...</p>
                                )}
                                {analysisResults[policy.PolicyName] && (
                                  <p className="text-sm text-black mt-2"><strong>AI Analysis:</strong> {analysisResults[policy.PolicyName]}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-black">No inline policies found.</p>
                          )}
                        </div>
                        <div className="mt-4">
                          <h4 className="text-md font-semibold text-black">Attached Policies</h4>
                          {user.attachedPolicies && user.attachedPolicies.length > 0 ? (
                            user.attachedPolicies.map((policy, index) => (
                              <div key={index} className="mt-2">
                                <p className="text-sm text-black"><strong>Policy Name:</strong> {policy.PolicyName}</p>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto text-black">
                                  <code>{decodeAndParseJson(policy.PolicyDocument)}</code>
                                </pre>
                                <button
                                  onClick={() => handleAnalyzePolicy(policy.PolicyName, policy.PolicyDocument)}
                                  className="mt-2 py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  Analyze Policy
                                </button>
                                {loadingPolicies[policy.PolicyName] && (
                                  <p className="text-sm text-black mt-2"><strong>AI Analysis:</strong> Analyzing data...</p>
                                )}
                                {analysisResults[policy.PolicyName] && (
                                  <p className="text-sm text-black mt-2"><strong>AI Analysis:</strong> {analysisResults[policy.PolicyName]}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-black">No attached policies found.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-black">No user data available.</p>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default OverlayIAMUser;
