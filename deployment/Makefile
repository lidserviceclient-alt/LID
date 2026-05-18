COMPOSE ?= docker compose
REPLICAS ?= 2

APP_COMPOSE = $(COMPOSE) -f docker-compose.yml
APP_OBSERVABILITY_COMPOSE = $(COMPOSE) -f docker-compose.yml -f docker-compose.observability.yml
OBSERVABILITY_COMPOSE = $(COMPOSE) -f observability/docker-compose.yml

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
	$(APP_COMPOSE) pull lid-api

pull-observability:
	$(OBSERVABILITY_COMPOSE) pull
	$(APP_OBSERVABILITY_COMPOSE) pull lid-api

up: pull
	$(APP_COMPOSE) up -d --pull always --force-recreate --scale "lid-api=$(REPLICAS)" lid-api

up-observability:
	$(OBSERVABILITY_COMPOSE) up -d --pull always
	$(APP_OBSERVABILITY_COMPOSE) up -d --pull always --force-recreate --scale "lid-api=$(REPLICAS)" lid-api

stop:
	$(APP_COMPOSE) stop

stop-observability:
	-$(APP_OBSERVABILITY_COMPOSE) stop
	$(OBSERVABILITY_COMPOSE) stop

down:
	$(APP_COMPOSE) down --remove-orphans

down-volumes:
	$(APP_COMPOSE) down -v --remove-orphans

down-observability:
	-$(APP_OBSERVABILITY_COMPOSE) down --remove-orphans
	$(OBSERVABILITY_COMPOSE) down --remove-orphans

down-observability-volumes:
	-$(APP_OBSERVABILITY_COMPOSE) down -v --remove-orphans
	$(OBSERVABILITY_COMPOSE) down -v --remove-orphans

ps:
	$(APP_COMPOSE) ps

ps-observability:
	$(APP_OBSERVABILITY_COMPOSE) ps
	$(OBSERVABILITY_COMPOSE) ps
