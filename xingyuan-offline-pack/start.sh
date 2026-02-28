#!/bin/bash

# Xingyuan 离线部署启动脚本
# 用法: ./start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  Xingyuan 离线部署启动脚本"
echo "=========================================="
echo ""

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装"
    exit 1
fi

# Docker Compose 命令
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "使用命令: $DOCKER_COMPOSE"
echo ""

# 检查 offline.env 文件
if [ ! -f "${SCRIPT_DIR}/offline.env" ]; then
    echo "警告: offline.env 文件不存在，正在从模板创建..."
    if [ -f "${SCRIPT_DIR}/offline.env.example" ]; then
        cp "${SCRIPT_DIR}/offline.env.example" "${SCRIPT_DIR}/offline.env"
        echo "已创建 offline.env 文件，请根据需要修改配置"
    else
        echo "错误: offline.env.example 不存在"
        exit 1
    fi
fi

# 检查核心镜像是否存在
echo "检查核心镜像..."
CORE_IMAGES=("xingyuan-api:1.13.0" "xingyuan-web:local" "xingyuan-sandbox:0.2.12" "xingyuan-plugin-daemon:0.5.3-local")
MISSING_IMAGES=()

for image in "${CORE_IMAGES[@]}"; do
    if ! docker image inspect "$image" &> /dev/null; then
        MISSING_IMAGES+=("$image")
    else
        echo "  ✓ $image"
    fi
done

if [ ${#MISSING_IMAGES[@]} -gt 0 ]; then
    echo ""
    echo "警告: 以下镜像缺失:"
    for img in "${MISSING_IMAGES[@]}"; do
        echo "  - $img"
    done
    echo ""
    echo "请先运行: ./load_images.sh"
    echo ""
    read -p "是否继续启动? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "  启动服务"
echo "=========================================="
echo ""

cd "$SCRIPT_DIR"

# 启动服务
$DOCKER_COMPOSE --env-file offline.env up -d

echo ""
echo "=========================================="
echo "  服务启动中..."
echo "=========================================="
echo ""

# 等待服务启动
echo "等待服务就绪..."
sleep 10

# 显示服务状态
echo ""
echo "服务状态:"
$DOCKER_COMPOSE ps

echo ""
echo "=========================================="
echo "  部署完成"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  - 控制台: http://localhost:3000"
echo "  - API 文档: http://localhost:5001/docs"
echo ""
echo "默认账户:"
echo "  - 邮箱: admin@example.com"
echo "  - 密码: admin123456"
echo ""
echo "查看日志: docker-compose --env-file offline.env logs -f"
echo "停止服务: ./stop.sh"
