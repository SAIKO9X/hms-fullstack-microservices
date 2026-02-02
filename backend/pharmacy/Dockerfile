FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -DskipTests -pl common-lib -am
RUN mvn clean package -DskipTests -pl pharmacy -am

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/pharmacy/target/*.jar app.jar
ENV SERVER_PORT=8084

EXPOSE $SERVER_PORT
ENTRYPOINT ["java", "-jar", "app.jar"]