# Shouya 离线部署操作手册

## 一、环境准备

### 1.1 前置要求

| 要求 | 最低版本 |
|------|----------|
| Docker | 20.10+ |
| Docker Compose | v2+ |
| 内存 | 8GB |
| 磁盘 | 50GB |

### 1.2 开放端口

| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | nginx | HTTP 访问 |
| 443 | nginx | HTTPS 访问 |
| 3000 | web | 前端界面 |
| 5001 | api | API 服务 |
| 5432 | postgres | 数据库（可选外部） |
| 6379 | redis | 缓存（可选外部） |

---

## 二、部署步骤

### 2.1 拷贝离线包

将整个 `shouya-offline-pack` 目录拷贝到目标服务器：

```bash
# 例如拷贝到 /opt 目录
cp -r shouya-offline-pack /opt/
cd /opt/shouya-offline-pack
```

### 2.2 加载镜像

**方式一：使用脚本自动加载（推荐）**

```bash
cd shouya-offline-pack/
chmod +x load_images.sh
./load_images.sh
```

**方式二：手动逐个加载**

```bash
cd shouya-offline-pack/images/
docker load -i shouya-api.tar
docker load -i shouya-web.tar
docker load -i shouya-sandbox.tar
docker load -i shouya-plugin-daemon.tar
docker load -i postgres.tar
docker load -i redis.tar
docker load -i nginx.tar
docker load -i weaviate.tar
docker load -i elasticsearch.tar
docker load -i squid.tar
```

**验证镜像加载成功**

```bash
docker images | grep -E "shouya|postgres|redis|nginx"
```

### 2.3 配置环境变量

```bash
# 复制环境变量模板
cp offline.env.example .env

# 编辑配置文件（可选，根据需要修改）
vi .env
```

**主要配置项说明**

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| SECRET_KEY | sk-9f73s3ljTXVcMT3... | 应用密钥，生产环境建议修改 |
| CONSOLE_WEB_URL | http://localhost:3000 | 控制台访问地址 |
| CONSOLE_API_URL | http://localhost:5001 | API 访问地址 |
| DB_PASSWORD | difyai123456 | 数据库密码 |
| REDIS_PASSWORD | difyai123456 | Redis 密码 |

### 2.4 启动服务

**方式一：使用启动脚本（推荐）**

```bash
cd /opt/shouya-offline-pack
chmod +x start.sh
./start.sh
```

**方式二：手动启动**

```bash
cd /opt/shouya-offline-pack

# 启动所有服务
docker-compose --env-file offline.env up -d

# 查看服务状态
docker-compose ps
```

### 2.5 验证部署

```bash
# 查看容器运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 检查端口监听
curl -s http://localhost:3000 | head -20
```

---

## 三、使用脚本

### 3.1 脚本说明

| 脚本 | 功能 |
|------|------|
| `load_images.sh` | 加载所有 Docker 镜像 |
| `start.sh` | 一键启动所有服务 |
| `stop.sh` | 停止所有服务 |

### 3.2 快速开始

```bash
# 1. 加载镜像
cd shouya-offline-pack/
./load_images.sh

# 2. 启动服务
./start.sh

# 3. 停止服务
./stop.sh
```

---

## 四、访问信息

| 服务 | 地址 |
|------|------|
| 控制台 | http://localhost:3000 |
| API 文档 | http://localhost:5001/docs |
| Nginx | http://localhost:80 |

**默认管理员账户**

- 邮箱：admin@example.com
- 密码：admin123456

> ⚠️ 首次登录后请立即修改默认密码

---

## 五、服务管理

### 5.1 常用命令

```bash
# 启动所有服务
docker-compose --env-file offline.env up -d

# 停止所有服务
docker-compose --env-file offline.env down

# 重启指定服务
docker-compose --env-file offline.env restart api

# 查看日志
docker-compose --env-file offline.env logs -f api

# 进入容器
docker exec -it shouya-offline-pack-api-1 bash
```

### 5.2 服务组件

| 容器名 | 镜像 | 说明 |
|--------|------|------|
| shouya-offline-pack-api-1 | shouya-api:local | API 服务 |
| shouya-offline-pack-web-1 | shouya-web:local | 前端界面 |
| shouya-offline-pack-worker-1 | shouya-api:local | 后台任务 |
| shouya-offline-pack-sandbox-1 | shouya-sandbox:local | 沙箱执行 |
| shouya-offline-pack-plugin-daemon-1 | shouya-plugin-daemon:local | 插件服务 |
| shouya-offline-pack-db_postgres-1 | postgres:15-alpine | PostgreSQL |
| shouya-offline-pack-redis-1 | redis:7-alpine | Redis 缓存 |
| shouya-offline-pack-nginx-1 | nginx:alpine | 反向代理 |

---

## 六、故障排查

### 6.1 常见问题

**问题：容器启动失败**

```bash
# 查看容器日志
docker-compose --env-file offline.env logs <服务名>

# 例如查看 api 日志
docker-compose --env-file offline.env logs api
```

**问题：端口被占用**

```bash
# 查看端口占用
netstat -tlnp | grep -E "3000|5001|80"

# 修改 docker-compose.yaml 中的端口映射
```

**问题：数据库连接失败**

```bash
# 检查数据库容器状态
docker-compose --env-file offline.env ps db_postgres

# 查看数据库日志
docker-compose --env-file offline.env logs db_postgres
```

### 6.2 重置数据

> ⚠️ 以下操作会删除所有数据，请谨慎执行

```bash
# 停止并删除所有数据卷
docker-compose --env-file offline.env down -v

# 重新启动
docker-compose --env-file offline.env up -d
```

---

## 七、数据备份

### 7.1 备份数据库

```bash
# 备份 PostgreSQL
docker exec -it shouya-offline-pack-db_postgres-1 pg_dump -U postgres dify > backup_$(date +%Y%m%d).sql
```

### 7.2 备份存储卷

```bash
# 备份 volumes 目录
tar -czvf volumes_backup_$(date +%Y%m%d).tar.gz volumes/
```

---

## 八、目录结构

```
shouya-offline-pack/
├── docker-compose.yaml          # Docker Compose 配置
├── offline.env.example          # 离线环境变量模板
├── load_images.sh              # 镜像加载脚本
├── start.sh                     # 启动脚本
├── stop.sh                      # 停止脚本
├── offline-deploy.md            # 部署手册
└── images/                      # Docker 镜像目录
    ├── shouya-api.tar         # API 镜像
    ├── shouya-web.tar         # Web 镜像
    ├── shouya-sandbox.tar    # Sandbox 镜像
    ├── shouya-plugin-daemon.tar  # Plugin 镜像
    └── ...                     # 其他镜像
```
