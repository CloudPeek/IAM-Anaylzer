'use client'
import { Layout } from "@/components/Layout";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black">AWS IAM Analyzer Tool</h1>
      
      <section className="mb-8 text-black">
        <h2 className="text-2xl font-semibold mb-4">Overly Permissive Roles</h2>
        <p className="mb-4">
          The AWS IAM Analyzer Tool helps identify roles and policies that are overly permissive.
          This ensures that the principle of least privilege is maintained, minimizing the risk of
          unauthorized access and potential security breaches.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Identifies roles with wide-ranging permissions</li>
          <li>Highlights roles with access to sensitive resources</li>
          <li>Provides recommendations to tighten permissions</li>
        </ul>
      </section>
      
      <section className="mb-8 text-black">
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <p className="mb-4">
          Following IAM best practices is crucial for maintaining a secure and efficient AWS environment.
          The IAM Analyzer Tool helps you adhere to these best practices by:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Encouraging the use of least privilege access</li>
          <li>Promoting the use of IAM roles instead of root user credentials</li>
          <li>Enforcing multi-factor authentication (MFA) for enhanced security</li>
          <li>Regularly rotating access keys to reduce the risk of compromised credentials</li>
        </ul>
      </section>
      
      <section className="mb-8 text-black">
        <h2 className="text-2xl font-semibold mb-4">What is IAM?</h2>
        <p className="mb-4">
          AWS Identity and Access Management (IAM) is a web service that helps you securely control access to
          AWS resources. IAM enables you to manage users and permissions, allowing you to:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Create and manage AWS users and groups</li>
          <li>Use permissions to allow and deny access to AWS resources</li>
          <li>Enable identity federation for single sign-on (SSO)</li>
          <li>Securely delegate access to resources across AWS accounts</li>
        </ul>
        <p>
          IAM provides fine-grained control over access to AWS services and resources, ensuring that only authorized
          users have the necessary permissions to perform their tasks.
        </p>
      </section>
    </div>
  
      );
}
