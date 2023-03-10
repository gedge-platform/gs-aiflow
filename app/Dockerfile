# 가져올 이미지를 정의
FROM node:14.21.3
# 경로 설정하기
WORKDIR /app
# package.json 워킹 디렉토리에 복사 (.은 설정한 워킹 디렉토리를 뜻함)
COPY package.json .
# 명령어 실행 (의존성 설치)
RUN npm install -g npm
RUN npm install react-router
RUN npm install react-router-dom
RUN npm install axios@^1.1.3
RUN npm install beautiful-react-diagrams@^0.5.1
RUN npm install react-hook-form@^7.39.2
# 현재 디렉토리의 모든 파일을 도커 컨테이너의 워킹 디렉토리에 복사한다.
COPY public ./public
COPY src ./src
COPY .env .

EXPOSE 3000

CMD ["npm","run", "start"]
