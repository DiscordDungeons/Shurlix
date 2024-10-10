run:
	cd ./crates/frontend && npm run build
	cargo run
build:
	cd ./crates/frontend && npm run build
	cargo build
build-frontend:
	cd ./crates/frontend && npm run build
watch:
	cargo watch -x "run"
watch-frontend:
	cd ./crates/frontend && npm run dev
dev:
	make watch-frontend & make watch