FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -DskipTests -pl common-lib -am
RUN mvn clean package -DskipTests -pl notification -am


FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/notification/target/*.jar app.jar
ENV SERVER_PORT=8087

EXPOSE $SERVER_PORT
ENTRYPOINT ["java", "-jar", "app.jar"]