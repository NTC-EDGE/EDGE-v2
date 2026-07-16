FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY EDGE.Backend.slnx ./
COPY EDGE.Api/EDGE.Api.csproj EDGE.Api/
COPY EDGE.Application/EDGE.Application.csproj EDGE.Application/
COPY EDGE.Domain/EDGE.Domain.csproj EDGE.Domain/
COPY EDGE.Infrastructure/EDGE.Infrastructure.csproj EDGE.Infrastructure/

# Restore dependencies
RUN dotnet restore EDGE.Api/EDGE.Api.csproj

# Copy rest of the code and publish
COPY . .
RUN dotnet publish EDGE.Api/EDGE.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "EDGE.Api.dll"]
