FROM nikolaik/python-nodejs:latest
RUN mkdir -p /home/node/cmssimple/node_modules
WORKDIR /home/node/cmssimple

COPY ./ ./

RUN npm install

EXPOSE 80

CMD /home/node/cmssimple/start.sh
