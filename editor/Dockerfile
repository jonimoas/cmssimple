FROM node:latest
RUN mkdir -p /home/node/cmseditor/node_modules

WORKDIR /home/node/cmseditor

COPY ./ ./

RUN npm install

RUN npm run build

EXPOSE 2000

CMD /home/node/cmseditor/start.sh
