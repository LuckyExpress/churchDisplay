# Project Title

docker version of church display

## Getting Started

docker / standalone
$docker build -t briandre/churchdisplay .
$docker run -it --rm -v c:/Users:/docker -p 3000:3000 -p 9857:9857 --name church briandre/churchdisplay

### Remarks

port 9857 is for reload - npm (automatic reload page when restart node.js) (default 9856)

volume mapping:
const dataPath = "/docker/churchDisplay/";
