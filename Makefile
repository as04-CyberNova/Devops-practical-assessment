# ==============================================================================
# Makefile for EduPulse Student Feedback Application & DevOps Assessment
# ==============================================================================

.PHONY: install dev start test lint docker-build docker-run docker-stop clean help

help:
	@echo "EduPulse DevOps Commands:"
	@echo "  make install       - Install Node.js dependencies"
	@echo "  make dev           - Start server in development watch mode"
	@echo "  make start         - Start production server"
	@echo "  make test          - Run automated test suite (Jest + Supertest)"
	@echo "  make lint          - Run ESLint code quality checks"
	@echo "  make docker-build  - Build multi-stage Docker image"
	@echo "  make docker-run    - Run containerized app on port 3000"
	@echo "  make docker-stop   - Stop and remove containers"
	@echo "  make clean         - Remove build artifacts and node_modules"

install:
	npm install

dev:
	npm run dev

start:
	npm start

test:
	npm test

lint:
	npm run lint

docker-build:
	docker build -t edupulse-feedback-app:latest .

docker-run:
	docker run -d -p 3000:3000 --name edupulse-app edupulse-feedback-app:latest

docker-stop:
	docker stop edupulse-app || true
	docker rm edupulse-app || true

clean:
	rm -rf node_modules coverage release-dist
