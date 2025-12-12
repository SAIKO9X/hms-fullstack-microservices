# Build da aplicação
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Pula os testes
RUN mvn clean package -DskipTests

# Execução
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV SERVER_PORT=8087

EXPOSE $SERVER_PORT
ENTRYPOINT ["java", "-jar", "app.jar"]