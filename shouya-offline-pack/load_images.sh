#!/bin/bash

# Shouya 离线镜像加载脚本
# 用法: ./load_images.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGES_DIR="${SCRIPT_DIR}/images"

echo "=========================================="
echo "  Shouya 离线镜像加载脚本"
echo "=========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

# 检查镜像目录
if [ ! -d "$IMAGES_DIR" ]; then
    echo "错误: 镜像目录不存在: $IMAGES_DIR"
    exit 1
fi

# 定义镜像列表
IMAGES=(
    "busybox.tar"
    "shouya-api.tar"
    "shouya-web.tar"
    "shouya-sandbox.tar"
    "shouya-plugin-daemon.tar"
    "postgres.tar"
    "redis.tar"
    "nginx.tar"
    "weaviate.tar"
    "elasticsearch.tar"
    "squid.tar"
)

# 统计
TOTAL=${#IMAGES[@]}
SUCCESS=0
FAILED=0

echo "镜像目录: $IMAGES_DIR"
echo "待加载镜像数量: $TOTAL"
echo ""
echo "=========================================="
echo ""

# 加载每个镜像
for image in "${IMAGES[@]}"; do
    image_path="${IMAGES_DIR}/${image}"

    if [ -f "$image_path" ]; then
        echo "[$((SUCCESS + FAILED + 1))/$TOTAL] 加载: $image"
        if docker load -i "$image_path" > /dev/null 2>&1; then
            echo "  ✓ 成功"
            ((SUCCESS++))
        else
            echo "  ✗ 失败"
            ((FAILED++))
        fi
    else
        echo "[$((SUCCESS + FAILED + 1))/$TOTAL] 跳过: $image (文件不存在)"
        ((FAILED++))
    fi
done

echo ""
echo "=========================================="
echo "  加载完成"
echo "=========================================="
echo "成功: $SUCCESS"
echo "失败: $FAILED"
echo ""

# 显示已加载的镜像
echo "当前本地镜像:"
docker images | grep -E "shouya|postgres|redis|nginx|weaviate|elasticsearch|squid" | head -20

echo ""
echo "镜像加载完成！"
echo ""
echo "下一步: ./start.sh"
