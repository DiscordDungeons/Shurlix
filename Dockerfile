FROM --platform="linux/amd64" debian:bookworm-20261104-slim@sha256:734a72b3d6142a71993b4bc580ca01d8ca687f77a2c422d96a961d3376b179bc as build

COPY ./install-packages.sh .
RUN chmod +x ./install-packages.sh 
RUN ./install-packages.sh

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

# Install node.js

RUN curl -sL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
RUN USER=root bash nodesource_setup.sh
RUN USER=root apt install -y nodejs

RUN USER=root cargo new --bin shurlix
WORKDIR /shurlix

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

FROM --platform="linux/amd64" debian:bookworm-20261104-slim@sha256:734a72b3d6142a71993b4bc580ca01d8ca687f77a2c422d96a961d3376b179bc

COPY ./install-packages.sh .
RUN chmod +x ./install-packages.sh 
RUN ./install-packages.sh

RUN chmod a+x /etc/ssl/certs

RUN update-ca-certificates

# Run as an unprivileged user
RUN useradd --system --create-home --uid 10001 shurlix

WORKDIR /home/shurlix

COPY --from=build --chown=shurlix:shurlix /shurlix/target/release/web-server /home/shurlix/shurlix

USER shurlix

EXPOSE 3000
CMD ["/home/shurlix/shurlix"]