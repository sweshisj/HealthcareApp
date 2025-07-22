# Healthcare Portal

This project is a full-stack healthcare portal and claim processing system. It demonstrates an event-driven microservices architecture leveraging .NET, React, and Azure cloud services, all containerized with Docker.

---

## Features
Claim Submission: Frontend for user claim input.

Asynchronous Processing: Azure Function triggered by Service Bus queue for claim processing.

Data Persistence: SQL Database for claims, policies, and user data.

Scalable & Decoupled Architecture: Designed for performance and resilience.

Containerized Development: Consistent local environment using Docker.

---

## Architecture

The system comprises three main services:

Frontend: React-based user interface.

Backend API: ASP.NET Core (.NET 8.0) API for business logic and data access.

Claim Processor: Azure Function for asynchronous claim processing.

Key Technologies: C#, JavaScript/TypeScript, React, ASP.NET Core (.NET 8.0), Entity Framework Core, SQL Server, Azure Service Bus, Docker, Docker Compose, Microsoft Azure (App Services, Azure Functions, Azure SQL Database, Azure Service Bus, Azure Container Registry).

---

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

git

docker desktop (includes docker engine and docker compose)

.net 9.0 sdk 

node & npm 

azure-functions-core-tools (v4) 

azurite (Azure Storage Emulator):

npm install -g azurite

Run in a dedicated terminal: azurite --skipApiVersionCheck

sql server express / localdb

sql server management studio (ssms)

## Local Setup & Execution

### Clone the repository:

```bash
git clone https://github.com/sweshisj/HealthcareApp.git
cd HealthcareApp
```

### Configure Local Settings:

Backend Database: Update Backend/appsettings.Development.json for your local SQL Server instance. Ensure host.docker.internal is used for Docker Desktop.

```JSON

"ConnectionStrings": {
  "DefaultConnection": "Server=host.docker.internal\\SQLEXPRESS;Database=HealthCareDb;User ID=your_sql_user;Password=your_sql_password;TrustServerCertificate=True;"
}
```
Azure Function: Create/update ClaimProcessor/local.settings.json for local Service Bus testing.

```JSON

{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet",
    "ServiceBusConnectionString": "Endpoint=sb://<your-service-bus-namespace>.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=<your-shared-access-key>"
  }
}
```
(Replace placeholders with your actual Azure Service Bus connection string.)

### Run Database Migrations (Backend):

```bash
cd Backend
dotnet ef database update
cd ..
```

### Launch Services with Docker Compose:

Ensure docker desktop is running.

Ensure azurite is running in a separate terminal.

From the root HealthcareApp directory:

```bash
docker compose up --build
```
Access the Frontend in your browser: http://localhost:3000.

### Stop Local Services:

In the terminal running docker compose up, press Ctrl + C.

To remove created containers and networks:

```bash
docker compose down
```

# Cloud Deployment (Azure)

The project is structured for deployment to Microsoft Azure.

## Push Container Images to Azure Container Registry (ACR):

### Log in to your ACR:

```bash
az acr login --name healthwarlock
```
Tag and push each service image (Frontend, Backend, ClaimProcessor). Example for the Claim Processor:

```bash
docker tag claimprocessor-function healthwarlock.azurecr.io/claimprocessor-function:latest
docker push healthwarlock.azurecr.io/claimprocessor-function:latest
```
(Repeat for healthcare-backend and healthcare-frontend images).

## Azure Service Configuration:

Azure SQL Database: Hosted for HealthCareDb.

Azure Service Bus: Provides the claimsubmissionqueue.

Azure Function App: The ClaimProcessor image deployed as a containerized Function App, configured with Azure Storage and Service Bus connection strings.

Azure App Services (or Container Apps): Backend API and Frontend deployed as containerized Web Apps, configured with appropriate environment variables (e.g., database connection string for backend, backend API URL for frontend).
