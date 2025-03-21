FROM node:21

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY backend/package*.json .
RUN npm install

# Bundle app source
COPY backend .

RUN mkdir -p ../frontend/src/model
COPY frontend/src/model ../frontend/src/model

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
# ENV MONGODB_CONNECTION_STRING=mongodb://root:welcome1@localhost:27017/habbithero

# Run the app
CMD [ "node", "main.mjs" ]