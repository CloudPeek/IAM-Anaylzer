# IAM Analysis Application

## Overview

The IAM Analysis Application is a web-based tool designed to provide comprehensive analysis of AWS IAM roles, users, groups, and identity providers. It utilizes the AWS SDK to fetch IAM data and provides insights into various IAM entities. Additionally, the application leverages AI capabilities to analyze IAM policies, providing detailed feedback on the security and compliance of these policies.

## Features

### IAM Roles
- **Listing and Details:** The app fetches and displays a list of IAM roles available in the AWS account. For each role, it shows the name, type, creation date, status, number of inline policies, and number of attached policies.
- **Policy Analysis:** Users can view detailed information about the inline and attached policies of each IAM role. AI-driven analysis of policies is available to provide insights into the security and compliance aspects of the policies.

### IAM Users
- **Listing and Details:** The app fetches and displays a list of IAM users available in the AWS account. For each user, it shows the name and creation date.
- **More Info:** Users can view more detailed information about each IAM user by clicking on the "More Info" link.

### IAM Groups
- **Listing and Details:** The app fetches and displays a list of IAM groups available in the AWS account. For each group, it shows the name, creation date, and policy information.
- **Policy Analysis:** Similar to roles, users can view detailed information about the inline and attached policies of each IAM group, along with AI-driven analysis.

### IAM Identity Providers
- **Listing and Details:** The app fetches and displays a list of IAM identity providers. For each provider, it shows the name, creation date, and policy information.
- **Policy Analysis:** Users can view detailed information about the policies associated with each IAM identity provider, with AI-driven analysis available.

### Data Caching
- **Local Storage:** The app caches IAM data in the local storage to reduce the number of API calls to AWS. The cached data is refreshed every 15 minutes to ensure that the information is up-to-date.

### Sorting
- **Column Sorting:** Users can sort the list of IAM entities (roles, users, groups, and identity providers) by different attributes such as name, type, status, creation date, and the number of policies.

### Error Handling
- **Notifications:** The app displays error notifications if there is an issue with fetching IAM data or analyzing policies.

## Usage

1. **Home Page:** Upon opening the app, users will see tabs for different IAM entities (Roles, Users, Groups, and Identity Providers).
2. **Selecting a Tab:** Users can select the appropriate tab to view the respective IAM entities.
3. **Viewing Details:** Clicking on an entity (role, user, group, or identity provider) will open an overlay with detailed information about the selected entity.
4. **Policy Analysis:** Within the detailed view, users can trigger AI-driven policy analysis to get insights into the policies' security and compliance.
