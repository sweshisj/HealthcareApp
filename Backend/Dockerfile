# HealthcareApp/Backend/Dockerfile
# Use a slim .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Install the Kerberos GSSAPI library for the build stage if needed by dotnet restore/build
# This helps if any tools during build process implicitly rely on it.
RUN apt-get update && apt-get install -y \
    libgssapi-krb5-2 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy the Backend.csproj and restore dependencies
# This caches the restore step, speeding up subsequent builds if dependencies don't change
# Since we are running docker build from HealthcareApp/Backend, Backend.csproj is directly in the context's root.
COPY ["Backend.csproj", "./"] 

RUN dotnet restore "Backend.csproj"

# Copy the rest of the application code
# All other files in Backend/ will be copied to /src
COPY . .

# Build the application
RUN dotnet build "Backend.csproj" -c Release -o /app/build

# Use a smaller ASP.NET runtime image for the final production image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install the Kerberos GSSAPI library for the final runtime image
RUN apt-get update && apt-get install -y \
    libgssapi-krb5-2 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Expose the port your application will listen on.
EXPOSE 8080

# Copy the built application from the build stage
COPY --from=build /app/build .

# Set the entry point to run your application
ENTRYPOINT ["dotnet", "Backend.dll"]