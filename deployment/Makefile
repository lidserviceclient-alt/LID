COMPOSE ?= docker compose
REPLICAS ?= 2
CONTROL = ./scripts/deployment/compose-control.sh

.PHONY: help pull pull-observability up up-observability stop stop-observability down down-volumes down-observability down-observability-volumes ps ps-observability

help:
	@echo "Targets:"
	@echo "  up                         Start LID API without observability"
	@echo "  up-observability            Start observability, then LID API with observability wiring"
	@echo "  stop                        Stop LID API stack without removing containers"
	@echo "  stop-observability          Stop LID API observability stack and observability services"
	@echo "  down                        Stop/remove LID API stack"
	@echo "  down-volumes                Stop/remove LID API stack and volumes"
	@echo "  down-observability          Stop/remove LID API stack and observability services"
	@echo "  down-observability-volumes  Stop/remove LID API stack, observability services and volumes"
	@echo "  ps                          Show LID API stack status"
	@echo "  ps-observability            Show LID API and observability stack status"

pull:
	COMPOSE="$(COMPOSE)" $(CONTROL) pull

pull-observability:
	COMPOSE="$(COMPOSE)" $(CONTROL) pull-observability

up:
	COMPOSE="$(COMPOSE)" REPLICAS="$(REPLICAS)" $(CONTROL) up

up-observability:
	COMPOSE="$(COMPOSE)" REPLICAS="$(REPLICAS)" $(CONTROL) up-observability

stop:
	COMPOSE="$(COMPOSE)" $(CONTROL) stop

stop-observability:
	COMPOSE="$(COMPOSE)" $(CONTROL) stop-observability

down:
	COMPOSE="$(COMPOSE)" $(CONTROL) down

down-volumes:
	COMPOSE="$(COMPOSE)" $(CONTROL) down-volumes

down-observability:
	COMPOSE="$(COMPOSE)" $(CONTROL) down-observability

down-observability-volumes:
	COMPOSE="$(COMPOSE)" $(CONTROL) down-observability-volumes

ps:
	COMPOSE="$(COMPOSE)" $(CONTROL) ps

ps-observability:
	COMPOSE="$(COMPOSE)" $(CONTROL) ps-observability
