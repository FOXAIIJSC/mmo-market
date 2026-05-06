FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY MmoMarket.sln ./
COPY src/MmoMarket.Domain/*.csproj src/MmoMarket.Domain/
COPY src/MmoMarket.Application/*.csproj src/MmoMarket.Application/
COPY src/MmoMarket.Infrastructure/*.csproj src/MmoMarket.Infrastructure/
COPY src/MmoMarket.Api/*.csproj src/MmoMarket.Api/
RUN dotnet restore MmoMarket.sln
COPY . .
RUN dotnet publish src/MmoMarket.Api/MmoMarket.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
RUN mkdir -p /data && chmod 0777 /data
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://+:8080
ENV ConnectionStrings__Default="Data Source=/data/mmo-market.db"
EXPOSE 8080
ENTRYPOINT ["dotnet", "MmoMarket.Api.dll"]
