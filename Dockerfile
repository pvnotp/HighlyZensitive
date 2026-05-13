# syntax=docker/dockerfile:1

FROM node:20-alpine AS client-build
WORKDIR /src

COPY highlyzensitive.client/package*.json ./highlyzensitive.client/
RUN npm ci --prefix highlyzensitive.client

COPY . .
RUN npm run build --prefix highlyzensitive.client

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS server-build
WORKDIR /src

COPY . .
COPY --from=client-build /src/HighlyZensitive.Server/wwwroot ./HighlyZensitive.Server/wwwroot

RUN dotnet restore HighlyZensitive.Server/HighlyZensitive.Server.csproj
RUN dotnet publish HighlyZensitive.Server/HighlyZensitive.Server.csproj -c Release -o /app/publish /p:UseAppHost=false /p:BuildProjectReferences=false /p:SkipClientProjectReference=true

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=server-build /app/publish .

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "dotnet HighlyZensitive.Server.dll --urls http://0.0.0.0:${PORT:-8080}"]
