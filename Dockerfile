FROM node:16

LABEL version="1.0"
LABEL description="React-based web page for visualizing Spiking Neural Network models."
LABEL maintainer = "Louis Ross <louis.ross@gmail.com"

WORKDIR /app

COPY ["./package.json", "./package-lock.json", "/app/"]

RUN ls
#RUN npm install --production
RUN ["npm", "install"]


COPY . .

EXPOSE 3000

CMD ["bash"]