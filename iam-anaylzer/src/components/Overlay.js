// src/components/Overlay.js
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { decodeAndParseJson } from '@/utils/decodeAndParseJson';
import { analyzePolicyOnRequest } from '@/components/AWSHelper';

const Overlay = ({ open, setOpen, role }) => {
  const [analysisResults, setAnalysisResults] = useState({});
  const [loadingPolicies, setLoadingPolicies] = useState({});

  const handleAnalyzePolicy = async (policyName, policyDocument) => {
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
                          Role Details
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
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <p className="text-sm text-black"><strong>Name:</strong> {role.name}</p>
                      <p className="text-sm text-black"><strong>ARN:</strong> {role.id}</p>
                      <p className="text-sm text-black"><strong>Created On:</strong> {new Date(role.created).toLocaleString()}</p>
                      <p className="text-sm text-black"><strong>Created By:</strong> {role.createdBy}</p>
                      <p className="text-sm text-black"><strong>Status:</strong> {role.status}</p>
                      <div className="mt-4">
                        <h4 className="text-md font-semibold text-black">Inline Policies</h4>
                        {role.inlinePolicies && role.inlinePolicies.length > 0 ? (
                          role.inlinePolicies.map((policy, index) => (
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
                        {role.attachedPolicies && role.attachedPolicies.length > 0 ? (
                          role.attachedPolicies.map((policy, index) => (
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

export default Overlay;
