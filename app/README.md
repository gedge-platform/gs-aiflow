

### Installation 

## Backend Server Install(Flask) 
### prerequisite(Recommand)
- Python 3.8

### Python package install
```shell
$ pip install -r requirements.txt
```


## React Install(by Nodejs)
###  Nodejs Install
```shell
$ curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
$ sudo apt install nodejs

$ node -v
>>> v14.21.1

$ npm -v
>>> 6.14.17
```

## React Package Install
```shell
$ sudo npm install -g npm

# current dir: gs-aiflow/app
$ cd app/
$ npm install react-router
$ npm install react-router-dom
$ npm install axios@^1.1.3
$ npm install beautiful-react-diagrams@^0.5.1
$ npm install react-hook-form@^7.39.2
```        

## Make Docker image
### React
```shell
$ sudo docker build -t react .
```
### Flask
```shell
$ sudo docker build -t flask -f DockerfilePython .
```

## Run Docker Container
### React
```shell
$ sudo docker run -d -p 3000:3000 --name react_container react
```
### Flask
```shell
$ sudo docker run -d -p 5500:5500 --name flask_container -e DB_HOST={DB host} -e DB_PORT={DB port} -e DB_USER={DB user} -e DB_PASS={DB pass} flask
```
