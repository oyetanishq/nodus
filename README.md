<h1 align="center">NODUS</h1>

check out it's live: [**nodus.tanishqsingh.com**](https://nodus.tanishqsingh.com)

- In latin _nodus_ means **knot**, mesh of peers tight like knot.
- Simple _**peer to peer**_

    1. video calling
    2. file sharing

### Read before use
- this uses webrtc internally so you **can't use vpn**,
- and if you are a tester then please open both tabs in **incognito**,
- otherwise it will not work [why this happens?](https://github.com/feross/simple-peer/issues/732)

<h2 align="center">Example Images</h2>

#### 1. File Share
![file share example](./preview/file-share-ex-1.png)

#### 2. Video Call
![video call example](./preview/video-call-ex-1.png)

<h2 align="center">Run Locally?</h2>

- preview **.env** files are provided in respective folder

#### Frontend
```bash
cd web

# Install packages
yarn

# Build frontend
yarn run build

# Serve dist folder
serve -s dist
```

#### Backend
1. with docker
```bash
cd backend

# To build docker image
docker build -t nodus-backend:v1 .

# To run container with port mapping, and env file
docker run -p 3000:3000 --env-file .env nodus-backend:v1
```

2. without docker
```bash
cd backend

go build main.go -o out
./out
```