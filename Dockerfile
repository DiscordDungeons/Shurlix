FROM --platform="linux/amd64" debian:bullseye-20240211-slim as build

COPY ./install-packages.sh .
RUN chmod +x ./install-packages.sh 
RUN ./install-packages.sh

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

# Install node.js

RUN curl -sL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
RUN USER=root bash nodesource_setup.sh
RUN USER=root apt install -y nodejs

RUN USER=root cargo new --bin shurlix
WORKDIR /shurlix

COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml

COPY ./src ./src
COPY ./crates ./crates

## Build frontend

WORKDIR /shurlix/crates/frontend
RUN npm i
RUN npm run build

WORKDIR /shurlix

# Build for release

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/home/root/app/target \
    cargo build --release

RUN ls /shurlix/target/release


#Final build

FROM --platform="linux/amd64" debian:bullseye-20240211-slim

COPY ./install-packages.sh .
RUN chmod +x ./install-packages.sh 
RUN ./install-packages.sh

RUN chmod a+x /etc/ssl/certs

RUN update-ca-certificates

WORKDIR /home

COPY --from=build /shurlix/target/release/web-server /home/shurlix


EXPOSE 3000
CMD ["/home/shurlix"]