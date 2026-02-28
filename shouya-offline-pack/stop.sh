#!/bin/bash

# Shouya 离线部署停止脚本
# 用法: ./stop.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  Shouya 离线部署停止脚本"
echo "=========================================="
echo ""

# Docker Compose 命令
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

cd "$SCRIPT_DIR"

# 停止服务
$DOCKER_COMPOSE --env-file offline.env down

echo ""
echo "服务已停止"
echo ""
echo "如需重新启动，请运行: ./start.sh"
